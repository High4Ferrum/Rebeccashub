import { cpSync, mkdirSync, writeFileSync, existsSync, rmSync, realpathSync, lstatSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
const root=realpathSync(process.cwd());
const output=resolve(root,'pages-dist');
if(dirname(output)!==root || (existsSync(output) && (lstatSync(output).isSymbolicLink() || realpathSync(output)!==output)))throw new Error('Unsafe output directory');
if(!existsSync('dist/server/index.js'))throw new Error('Build the application first.');
rmSync(output,{recursive:true,force:true});
mkdirSync(output,{recursive:true});
cpSync('dist/client',output,{recursive:true});
mkdirSync(resolve(output,'_worker.js'),{recursive:true});
cpSync('dist/server',resolve(output,'_worker.js/server'),{recursive:true});
writeFileSync(resolve(output,'_worker.js/index.js'),`import app from './server/index.js';
export default {
 async fetch(request, env, ctx) {
  const path = new URL(request.url).pathname;
  if (path.startsWith('/_next/static/') || path === '/favicon.svg' || path === '/pdf.worker.min.mjs') return env.ASSETS.fetch(request);
  return app.fetch(request, env, ctx);
 }
};\n`);
writeFileSync(resolve(output,'_routes.json'),JSON.stringify({version:1,include:['/*'],exclude:['/_next/static/*','/favicon.svg','/pdf.worker.min.mjs']}));
writeFileSync(resolve(output,'_headers'),`/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: same-origin
  X-Frame-Options: DENY
`);
console.log('Cloudflare Pages output prepared in pages-dist.');
