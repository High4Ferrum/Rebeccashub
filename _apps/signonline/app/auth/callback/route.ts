import { cookies } from 'next/headers';
import { provider,unseal,seal,verifyIdentity,loginCookie,sessionCookie,cookieHeader } from '@/lib/auth';
export async function GET(request:Request){
 try{
 const {c,p}=await provider();const q=new URL(request.url).searchParams;const token=(await cookies()).get(loginCookie)?.value;
 if(!token||!q.get('code')||!q.get('state')||q.has('error'))throw new Error('Login cancelled.');
 const flow=await unseal(token);if(flow.kind!=='login'||flow.state!==q.get('state')||typeof flow.verifier!=='string'||typeof flow.nonce!=='string')throw new Error('Invalid login.');
 const r=await fetch(p.token_endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',code:q.get('code')!,client_id:c.OIDC_CLIENT_ID,client_secret:c.OIDC_CLIENT_SECRET,redirect_uri:`${c.APP_ORIGIN}/auth/callback`,code_verifier:flow.verifier})});
 if(!r.ok)throw new Error('Provider rejected login.');const tokens:any=await r.json();if(typeof tokens.id_token!=='string')throw new Error('Missing identity.');
 const identity=await verifyIdentity(tokens.id_token,flow.nonce,p,c);
 const session=await seal({kind:'session',sub:`${c.OIDC_ISSUER}|${identity.sub}`,email:identity.email,name:typeof identity.name==='string'?identity.name:null},'8h');
 const h=new Headers({Location:c.APP_ORIGIN,'Cache-Control':'no-store'});h.append('Set-Cookie',cookieHeader(sessionCookie,session,28800));h.append('Set-Cookie',cookieHeader(loginCookie,'',0));return new Response(null,{status:302,headers:h});
 }catch{return new Response('Sign-in could not be completed. Return to the app and try signing in again.',{status:400,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','Set-Cookie':cookieHeader(loginCookie,'',0)}});}
}
