import { createRemoteJWKSet, jwtVerify } from 'jose';

type Settings = Record<string, string>;
type ClerkSession = { id: string; user_id: string; status: string; expire_at: number; abandon_at: number };
type ClerkUser = { id: string; banned?: boolean; locked?: boolean; first_name?: string; last_name?: string; primary_email_address_id: string; email_addresses: { id: string; email_address: string; verification?: { status: string } }[] };

export function clerkSettings(c: Settings) {
  const key = c.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!/^pk_live_[A-Za-z0-9_-]+$/.test(key || '') || !c.CLERK_SECRET_KEY?.startsWith('sk_live_')) throw new Error('Clerk is not configured.');
  const host = atob(key.slice(8)).replace(/\$$/, '');
  if (!/^[a-z0-9.-]+$/.test(host) || !host.includes('.')) throw new Error('Invalid Clerk host.');
  const origin = new URL(c.APP_ORIGIN).origin;
  if (!origin.startsWith('https://')) throw new Error('HTTPS required.');
  return { key, issuer: `https://${host}`, origin };
}

async function clerkRequest<T>(c: Settings, path: string, method = 'GET'): Promise<T> {
  const response = await fetch(`https://api.clerk.com/v1${path}`, {
    method, headers: { Authorization: `Bearer ${c.CLERK_SECRET_KEY}` },
    cache: 'no-store', signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('Identity service unavailable.');
  return response.json() as Promise<T>;
}

export async function activeClerkIdentity(c: Settings, sid: string, sub: string) {
  clerkSettings(c);
  if (!/^sess_[a-zA-Z0-9]+$/.test(sid) || !/^user_[a-zA-Z0-9]+$/.test(sub)) throw new Error('Invalid identity.');
  const session = await clerkRequest<ClerkSession>(c, `/sessions/${sid}`);
  if (session.id !== sid || session.user_id !== sub || session.status !== 'active' || !(session.expire_at > Date.now()) || !(session.abandon_at > Date.now())) throw new Error('Session ended.');
  const user = await clerkRequest<ClerkUser>(c, `/users/${sub}`);
  const email = user.email_addresses?.find(e => e.id === user.primary_email_address_id && e.verification?.status === 'verified');
  if (user.id !== sub || user.banned || user.locked || !email) throw new Error('Verified email required.');
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || null;
  return { userId: `clerk:${sub}`, email: email.email_address.toLowerCase(), fullName: name, displayName: name || email.email_address };
}

export async function verifyClerkToken(c: Settings, token: string) {
  const { issuer, origin } = clerkSettings(c);
  const { payload } = await jwtVerify(token, createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`)), {
    issuer, algorithms: ['RS256'], requiredClaims: ['sub', 'sid', 'exp', 'nbf', 'iat', 'azp'], maxTokenAge: '5m',
  });
  if (payload.azp !== origin || payload.sts === 'pending' || typeof payload.sid !== 'string' || typeof payload.sub !== 'string') throw new Error('Invalid session.');
  const user = await activeClerkIdentity(c, payload.sid, payload.sub);
  return { user, sid: payload.sid, sub: payload.sub };
}

export async function revokeClerkSession(c: Settings, sid: string) {
  if (!/^sess_[a-zA-Z0-9]+$/.test(sid)) throw new Error('Invalid session.');
  await clerkRequest(c, `/sessions/${sid}/revoke`, 'POST');
}
