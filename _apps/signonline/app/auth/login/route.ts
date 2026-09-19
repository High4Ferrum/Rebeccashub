import { provider, seal, loginCookie, cookieHeader } from '@/lib/auth';
import { randomBytes, createHash } from 'node:crypto';
import { config } from '@/lib/auth';
import { clerkLoginPage } from '@/lib/clerk-page';
import { cookies } from 'next/headers';
import { invitationId } from '@/lib/invitation';
export async function GET(request:Request){
 if(process.env.NODE_ENV==='development')return Response.redirect(new URL('/signin-with-chatgpt?return_to=/',request.url));
 try {
 if(config().NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY){
 const c=config(); const url=new URL(request.url);
 if(url.origin!==c.APP_ORIGIN)return Response.redirect(new URL(url.pathname+url.search,c.APP_ORIGIN),302);
 const id=invitationId(url.searchParams.get('transaction'))||invitationId((await cookies()).get('__Host-signonline_invitation')?.value);
 const response=clerkLoginPage(c,id);
 if(id)response.headers.append('Set-Cookie',cookieHeader('__Host-signonline_invitation',id,3600));
 return response;
 }
 const {c,p}=await provider();const state=randomBytes(24).toString('base64url');const nonce=randomBytes(24).toString('base64url');const verifier=randomBytes(32).toString('base64url');
 const target=new URL(p.authorization_endpoint);target.search=new URLSearchParams({client_id:c.OIDC_CLIENT_ID,redirect_uri:`${c.APP_ORIGIN}/auth/callback`,response_type:'code',scope:'openid email profile',state,nonce,code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256'}).toString();
 const token=await seal({kind:'login',state,nonce,verifier},'10m');return new Response(null,{status:302,headers:{Location:target.toString(),'Set-Cookie':cookieHeader(loginCookie,token,600),'Cache-Control':'no-store'}});
 }catch{return new Response('SignOnline sign-in is not configured yet. The owner must connect the sign-in provider before this app can be used.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});}
}
