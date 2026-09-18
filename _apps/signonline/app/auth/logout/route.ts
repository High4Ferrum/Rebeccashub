import { cookieHeader,sessionCookie } from '@/lib/auth';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Invalid origin',{status:403});
 return new Response(null,{status:303,headers:{Location:'/','Set-Cookie':cookieHeader(sessionCookie,'',0),'Cache-Control':'no-store'}});
}
