import { clerkSettings } from './clerk';

export function clerkLoginPage(c: Record<string, string>) {
  const { key, issuer } = clerkSettings(c);
  // Values are restricted to URL/key characters before being placed in HTML.
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in | SignOnline</title>
<style>body{margin:0;background:#f5f7f8;color:#182f36;font:16px system-ui}main{max-width:460px;margin:8vh auto;padding:24px}h1{font-size:30px}p{line-height:1.6}a{color:#126657}#message{min-height:25px}button{padding:10px 16px;cursor:pointer}</style>
<script defer crossorigin="anonymous" src="${issuer}/npm/@clerk/ui@1/dist/ui.browser.js"></script>
<script defer crossorigin="anonymous" data-clerk-publishable-key="${key}" src="${issuer}/npm/@clerk/clerk-js@6/dist/clerk.browser.js"></script></head>
<body><main><h1>SignOnline</h1><p>Sign in with the email address your transaction invitation was sent to.</p><p id="message" role="status">Loading secure sign-in…</p><div id="sign-in"></div><p><a href="/">Back to workspace</a></p></main>
<script>window.addEventListener('load',async()=>{const message=document.getElementById('message');try{
await Clerk.load({ui:{ClerkUI:window.__internal_ClerkUICtor}});
if(Clerk.session){message.textContent='Opening your workspace…';const token=await Clerk.session.getToken();
const response=await fetch('/auth/clerk',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});
if(!response.ok)throw new Error('Sign-in could not be completed. Please try again.');window.location.replace('/');
}else{message.textContent='Use an email code to continue.';Clerk.mountSignIn(document.getElementById('sign-in'),{routing:'hash',forceRedirectUrl:window.location.origin+'/auth/login',signUpForceRedirectUrl:window.location.origin+'/auth/login'});}
}catch(error){message.textContent='Secure sign-in is temporarily unavailable. Please reload this page or contact the workspace owner.';}});</script></body></html>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin' },
  });
}
