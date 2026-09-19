import { cookieHeader,sessionCookie,unseal,config } from '@/lib/auth';
import { cookies } from 'next/headers';
import { revokeClerkSession } from '@/lib/clerk';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Invalid origin',{status:403});
 const token=(await cookies()).get(sessionCookie)?.value;
 if(token){
   let session;try{session=await unseal(token);}catch{/* Expired local session is cleared below. */}
   if(session?.provider==='clerk'&&typeof session.sid==='string'){
     try{await revokeClerkSession(config(),session.sid);}catch{return new Response('Sign-out could not be completed. Please try again.',{status:503,headers:{'Cache-Control':'no-store'}});}
   }
 }
 return new Response(null,{status:303,headers:{Location:'/','Set-Cookie':cookieHeader(sessionCookie,'',0),'Cache-Control':'no-store'}});
}
