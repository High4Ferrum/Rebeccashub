import { env } from 'cloudflare:workers';
import { cookies, headers } from 'next/headers';
import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';
export type AppUser = { userId: string; displayName: string; email: string; fullName: string | null };
export const sessionCookie = '__Host-signonline_session';
export const loginCookie = '__Host-signonline_login';
export const config = () => env as unknown as Record<string,string>;
export function sessionKey() {
 const secret=config().AUTH_SESSION_SECRET;
 if (!secret || secret.length < 32) throw new Error('Sign-in is not configured.');
 return new TextEncoder().encode(secret);
}
export async function seal(payload: Record<string,unknown>, duration: string) {
 return new SignJWT(payload).setProtectedHeader({alg:'HS256'}).setIssuer('signonline').setAudience('signonline-session').setIssuedAt().setExpirationTime(duration).sign(sessionKey());
}
export async function unseal(token:string) {
 return (await jwtVerify(token, sessionKey(), {algorithms:['HS256'],issuer:'signonline',audience:'signonline-session'})).payload;
}
export async function getAppUser():Promise<AppUser|null> {
 // Local preview strips incoming identity headers and injects its own test user.
 // Public deployments NEVER trust these headers.
 if (process.env.NODE_ENV === 'development') {
  const h=await headers(); const id=h.get('oai-authenticated-user-id');const email=h.get('oai-authenticated-user-email');
  if(id&&email)return {userId:id,email:email.toLowerCase(),displayName:email,fullName:null};
 }
 const token=(await cookies()).get(sessionCookie)?.value; if(!token)return null;
 try { const p=await unseal(token); if(p.kind!=='session'||typeof p.sub!=='string'||typeof p.email!=='string')return null;
 const name=typeof p.name==='string'?p.name:null;
 return {userId:p.sub,email:p.email.toLowerCase(),displayName:name||p.email,fullName:name};
 } catch {return null;}
}
export async function provider() {
 const c=config(); const issuer=c.OIDC_ISSUER;
 if(!issuer||!c.OIDC_CLIENT_ID||!c.OIDC_CLIENT_SECRET||!c.APP_ORIGIN)throw new Error('Sign-in is not configured.');
 sessionKey();
 const base=new URL(issuer);if(base.protocol!=='https:')throw new Error('HTTPS issuer required.');
 const r=await fetch(`${issuer.replace(/\/$/,'')}/.well-known/openid-configuration`);if(!r.ok)throw new Error('Sign-in provider unavailable.');
 const p:any=await r.json();if(p.issuer!==issuer)throw new Error('Invalid sign-in provider.');
 for(const key of ['authorization_endpoint','token_endpoint','jwks_uri'])if(new URL(p[key]).protocol!=='https:')throw new Error('Invalid sign-in endpoint.');
 return {c,p};
}
export async function verifyIdentity(token:string,nonce:string,p:any,c:Record<string,string>) {
 const {payload}=await jwtVerify(token,createRemoteJWKSet(new URL(p.jwks_uri)),{issuer:c.OIDC_ISSUER,audience:c.OIDC_CLIENT_ID,algorithms:['RS256','ES256']});
 if(payload.nonce!==nonce||payload.email_verified!==true||typeof payload.email!=='string'||typeof payload.sub!=='string')throw new Error('A verified email is required.');
 if(Array.isArray(payload.aud)&&payload.aud.length>1&&payload.azp!==c.OIDC_CLIENT_ID)throw new Error('Invalid authorized party.');
 return payload;
}
export function cookieHeader(name:string,value:string,maxAge:number){return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;}
