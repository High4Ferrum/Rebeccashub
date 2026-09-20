'use client';
import { useState } from 'react';

export default function ShareDocument({doc,transaction,user,notify,mutate,busy}:any){
 const current=transaction.documents.find((d:any)=>d.id===doc.id)||doc;
 const [assignments,setAssignments]=useState<Record<string,string>>({});
 const [selected,setSelected]=useState<string[]>([]);
 const [editing,setEditing]=useState(false);
 const fields=current.fields||[];
 const signed=fields.some((f:any)=>f.value!==''&&f.value!==null&&f.value!==undefined);
 const canPrepare=transaction.isOwner&&current.status!=='Signed'&&!signed;
 const emailFor=(f:any)=>assignments[f.id]??f.email;
 const assigned=Array.from(new Set<string>(fields.map((f:any)=>f.email)));
 const eligible=transaction.participants.filter((p:any)=>current.status==='Signed'||assigned.includes(p.email));
 const recipients=selected.filter(e=>eligible.some((p:any)=>p.email===e));
 const ready=current.status!=='Draft'&&!editing&&recipients.length>0;
 const link=`https://signonline.rebeccayener.com/?transaction=${encodeURIComponent(transaction.id)}`;
 return <><h2>{current.status==='Signed'?'Share completed document':'Set up signature recipients'}</h2><p>{current.name}</p>
 {transaction.isOwner&&<form onSubmit={async e=>{e.preventDefault();const form=e.currentTarget;const data=Object.fromEntries(new FormData(form));try{await mutate({action:'participant',transactionId:transaction.id,...data});form.reset();notify('Recipient added. Assign their fields below.');}catch{}}}>
 <h3>1. Add a recipient</h3><label>Full name<input name="name" required maxLength={100}/></label><label>Email address<input name="email" type="email" required/></label><label>Role<select name="role">{['Buyer','Seller','Buyer agent','Seller agent','Tenant','Landlord'].map(r=><option key={r}>{r}</option>)}</select></label><p className="inline-note">This person will be able to access this transaction after signing in with this email.</p><button className="button secondary wide" disabled={busy}>Add recipient</button></form>}
 {canPrepare&&<><h3>2. Assign signing fields</h3><p>Choose who completes each field. Existing unsigned requests can be corrected here.</p>{fields.map((f:any,i:number)=><label key={f.id}>{f.type} {i+1} · page {f.page}<select value={emailFor(f)} onChange={e=>{setAssignments({...assignments,[f.id]:e.target.value});setEditing(true);setSelected([]);}}><option value="">Choose a signer</option><option value={user.email}>Me · {user.email}</option>{transaction.participants.filter((p:any)=>p.email!==user.email).map((p:any)=><option key={p.email} value={p.email}>{p.name} · {p.email}</option>)}</select></label>)}<button className="button primary wide" disabled={busy||!fields.length||fields.some((f:any)=>!emailFor(f))} onClick={async()=>{try{await mutate({action:'prepareRecipients',transactionId:transaction.id,documentId:current.id,assignments:fields.map((f:any)=>({id:f.id,email:emailFor(f)}))});setEditing(false);setAssignments({});setSelected(transaction.participants.filter((p:any)=>fields.some((f:any)=>emailFor(f)===p.email)).map((p:any)=>p.email));notify('Recipients saved. You can now share the invitation.');}catch{}}}>Save recipients and prepare for signing</button></>}
 <h3>{current.status==='Signed'?'Recipients':'3. Select recipients and share'}</h3>
 {!eligible.length&&<p>Add a recipient and assign at least one field to their email before sharing a signature request.</p>}
 {eligible.map((p:any)=><label key={p.email}><input type="checkbox" checked={recipients.includes(p.email)} onChange={e=>setSelected(e.target.checked?[...selected,p.email]:selected.filter(x=>x!==p.email))}/>{p.name} · {p.email}</label>)}
 {ready?<><button className="button secondary wide" onClick={async()=>{try{await navigator.clipboard.writeText(link);notify('Invitation link copied for the selected recipients.');}catch{notify('Copy the link shown below.');}}}>Copy invitation link</button><input className="share-link" value={link} readOnly aria-label="Invitation link"/><a className="button primary wide" href={`mailto:${recipients.join(',')}?subject=${encodeURIComponent(`${current.status==='Signed'?'Completed document':'Signature requested'}: ${transaction.address}`)}&body=${encodeURIComponent(`Open your transaction: ${link}\n\nSign in using the email address this invitation was sent to.`)}`}>Open email draft</a><p className="inline-note">The link opens this transaction only for authorized participants. Changing the recipient in your email app does not grant access. Email is not sent automatically.</p></>:<p className="inline-note">Save the signing assignments and select a recipient to enable sharing.</p>}
 </>;
}
