'use client';
import { TERMS_VERSION, TERMS_TEXT } from '@/lib/consent';
export default function Terms(){return <main style={{maxWidth:760,margin:'40px auto',padding:24}}><h1>Electronic transaction terms</h1><p>Version {TERMS_VERSION}</p><div style={{whiteSpace:'pre-wrap',lineHeight:1.8}}>{TERMS_TEXT}</div><button className="button primary" onClick={()=>window.print()}>Print or save terms</button><p><a href="/">Back to SignOnline</a></p></main>}
