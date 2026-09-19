import { config, seal, sessionCookie, cookieHeader } from '@/lib/auth';
import { verifyClerkToken } from '@/lib/clerk';

export async function POST(request: Request) {
  const c = config();
  if (request.headers.get('origin') !== c.APP_ORIGIN || new URL(request.url).origin !== c.APP_ORIGIN) return new Response('Invalid origin', { status: 403 });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return new Response('JSON required', { status: 415 });
  try {
    // Limit before parsing so an unauthenticated request cannot allocate an unbounded body.
    const reader = request.body?.getReader();
    if (!reader) throw new Error('Missing body');
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 16384) { await reader.cancel(); return new Response('Too large', { status: 413 }); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof body.token !== 'string' || body.token.length > 12000) throw new Error('Invalid token');
    const { user, sid, sub } = await verifyClerkToken(c, body.token);
    const session = await seal({ kind: 'session', provider: 'clerk', sub: user.userId, clerkSub: sub, sid, email: user.email, name: user.fullName }, '8h');
    return Response.json({ ok: true }, { headers: { 'Set-Cookie': cookieHeader(sessionCookie, session, 28800), 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Sign-in could not be verified. Please try again.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
}
