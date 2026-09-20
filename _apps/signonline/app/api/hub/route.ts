import { validFieldSize } from '@/lib/field-size';
import { TERMS_VERSION, TERMS_TEXT, SIGNING_CONSENT } from '@/lib/consent';
import { hashBytes, requestEvidence, auditPdf } from '@/lib/audit';
import { getAppUser as getChatGPTUser, config } from '@/lib/auth';
import { db, bucket, record } from '@/lib/storage';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { recipientFields } from '@/lib/recipient-fields';
import { emailRecipients, sendDocumentEmail } from '@/lib/email';
export const dynamic = 'force-dynamic';
const bad = (message: string, status = 400) => Response.json({ error: message }, { status });
async function signedKey(id: string, fields: string) {
 const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fields));
 return `${id}/signed-${Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('')}`;
}
async function transaction(id: string, user: any, ownerOnly = false) {
 const t: any = await db().prepare('SELECT * FROM transactions WHERE id = ?').bind(id).first();
 if (!t) return null;
 const data = JSON.parse(t.data);
 if (t.owner !== user.userId && (ownerOnly || !data.participants.some((p: any) => p.email.toLowerCase() === user.email.toLowerCase()))) return null;
 return { ...t, ...data, isOwner: t.owner === user.userId };
}
export async function GET(request: Request) {
 try {
 const user = await getChatGPTUser(); if (!user) return bad('Please sign in to your workspace.', 401);
 const consent:any=await db().prepare('SELECT message FROM events WHERE id = ?').bind('consent:'+user.userId+':'+TERMS_VERSION).first();
 if(!consent)return Response.json({transactions:[],user:{email:user.email,name:user.fullName||user.email,needsTerms:true}},{headers:{'Cache-Control':'no-store'}});
 const q = new URL(request.url).searchParams;
 if(q.has('audit')){
 const doc:any=await db().prepare('SELECT * FROM documents WHERE id = ?').bind(q.get('audit')).first();
 if(!doc||!await transaction(doc.transaction_id,user))return bad('Document not found.',404);
 const original=await bucket().get(doc.id);if(!original)return bad('Original unavailable.',503);
 const fields=JSON.parse(doc.fields);const records=Array.from(new Map(fields.filter((f:any)=>f.audit).map((f:any)=>[f.audit.eventId,f.audit])).values());
 let completedPdfSha256=null;if(doc.status==='Signed'){const file=await bucket().get(await signedKey(doc.id,doc.fields));if(!file)return bad('Completed PDF unavailable.',503);completedPdfSha256=await hashBytes(await file.arrayBuffer());}
 const report={title:'SignOnline signing audit record',documentId:doc.id,documentName:doc.name,transactionId:doc.transaction_id,status:doc.status,generatedAt:new Date().toISOString(),originalPdfSha256:await hashBytes(await original.arrayBuffer()),completedPdfSha256,signingEvents:records,legacyFieldsWithoutDetailedEvidence:fields.filter((f:any)=>f.signedAt&&!f.audit).map((f:any)=>({fieldId:f.id,email:f.email,signedAt:f.signedAt,accountId:f.signedBy})),notice:'Supporting evidence, not notarization or independent identity verification. Earlier signatures may lack detailed evidence. Hashes alone do not prevent an administrator from altering stored records.'};
 return new Response(new Uint8Array(await auditPdf(report)),{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="signonline-audit.pdf"','Cache-Control':'private, no-store'}});
 }
 if (q.has('file')) {
 const doc: any = await db().prepare('SELECT * FROM documents WHERE id = ?').bind(q.get('file')).first();
 if (!doc || !await transaction(doc.transaction_id, user)) return bad('Document not found.', 404);
 const file = await bucket().get(q.get('signed') === 'true' && doc.status === 'Signed' ? await signedKey(doc.id, doc.fields) : doc.id);
 if (!file) return bad('Document unavailable.', 404);
 return new Response(file.body, { headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'private, no-store', 'Content-Disposition': `${q.has('download') ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(doc.name)}` } });
 }
 const rows = await db().prepare("SELECT * FROM transactions WHERE owner = ? OR EXISTS (SELECT 1 FROM json_each(json_extract(data, '$.participants')) WHERE lower(json_extract(value, '$.email')) = lower(?)) ORDER BY created DESC").bind(user.userId, user.email).all();
 const transactions = await Promise.all(rows.results.map(async (r: any) => {
 const docs = await db().prepare('SELECT * FROM documents WHERE transaction_id = ? ORDER BY created DESC').bind(r.id).all();
 const events = await db().prepare('SELECT * FROM events WHERE transaction_id = ? ORDER BY created DESC LIMIT 40').bind(r.id).all();
 return { id: r.id, ...JSON.parse(r.data), isOwner: r.owner === user.userId, documents: docs.results.map((d: any) => ({ ...d, fields: JSON.parse(d.fields) })), events: events.results };
 }));
 return Response.json({ transactions, user: { name: user.fullName || user.email, email: user.email, isWorkspaceOwner: user.email.toLowerCase() === config().WORKSPACE_OWNER_EMAIL?.toLowerCase() } }, { headers: { 'Cache-Control': 'no-store' } });
 } catch (e) { console.error(e); return bad('The workspace could not be loaded. Please try again.', 503); }
}
export async function POST(request: Request) {
 try {
 const user = await getChatGPTUser(); if (!user) return bad('Please sign in.', 401);
 if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return bad('Invalid origin.', 403);
 const consentId='consent:'+user.userId+':'+TERMS_VERSION;
 const accountConsent:any=await db().prepare('SELECT message FROM events WHERE id = ?').bind(consentId).first();
 if (request.headers.get('content-type')?.includes('multipart/form-data')) {
 if(!accountConsent)return bad('Accept the electronic transaction terms first.',403);
 const form = await request.formData(); const tid = String(form.get('transactionId')); const t = await transaction(tid, user, true);
 if (!t) return bad('Transaction not found.', 404);
 const files = form.getAll('files') as File[];
 if (!files.length || files.length > 10) return bad('Upload 1–10 PDF files at a time.');
 for (const file of files) { if (!(file instanceof File) || file.size > 15 * 1024 * 1024 || file.size === 0) return bad('Each PDF must be between 1 byte and 15 MB.'); }
 for (const file of files) {
 const bytes = await file.arrayBuffer();
 try { await PDFDocument.load(bytes); } catch { return bad(`${file.name} is not a readable, unencrypted PDF.`); }
 const id = crypto.randomUUID(); await bucket().put(id, bytes, { httpMetadata: { contentType: 'application/pdf' } });
 await db().prepare('INSERT INTO documents (id, transaction_id, name, category, status, fields, created) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id, tid, file.name.slice(0, 200), String(form.get('category') || 'Other'), 'Draft', '[]', new Date().toISOString()).run();
 await record(tid, `${user.displayName} uploaded ${file.name}`);
 }
 return Response.json({ ok: true });
 }
 const b: any = await request.json();
 if(b.action==='acceptTerms'){
 if(b.accepted!==true||b.version!==TERMS_VERSION)return bad('Review and accept the current terms.',400);
 const evidence={version:TERMS_VERSION,text:TERMS_TEXT,email:user.email,accountId:user.userId,acceptedAt:new Date().toISOString(),...requestEvidence(request)};
 await db().prepare('INSERT OR IGNORE INTO events (id, transaction_id, message, created) VALUES (?, ?, ?, ?)').bind(consentId,'account-consent',JSON.stringify(evidence),evidence.acceptedAt).run();return Response.json({ok:true});
 }
 if(!accountConsent)return bad('Accept the electronic transaction terms first.',403);
 if (b.action === 'create') {
 if (process.env.NODE_ENV !== 'development' && (!config().WORKSPACE_OWNER_EMAIL || user.email.toLowerCase() !== config().WORKSPACE_OWNER_EMAIL.toLowerCase())) return bad('Only the workspace owner can create transactions.', 403);
 if (!b.address?.trim() || !['Sale','Purchase','Lease'].includes(b.type)) return bad('Enter an address and transaction type.');
 const id = crypto.randomUUID(); const data = { address: b.address.trim().slice(0, 180), city: String(b.city || '').slice(0, 160), type: b.type, price: String(b.price || ''), closing: b.closing || '', stage: 'In progress', participants: [] };
 await db().prepare('INSERT INTO transactions (id, owner, data, created) VALUES (?, ?, ?, ?)').bind(id, user.userId, JSON.stringify(data), new Date().toISOString()).run();
 await record(id, 'Transaction workspace created'); return Response.json({ id });
 }
 const t = await transaction(b.transactionId, user, !['sign','recipientFields'].includes(b.action)); if (!t) return bad('Transaction not found.', 404);
 if (b.action === 'participant') {
 if (!b.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) || !['Buyer','Seller','Buyer agent','Seller agent','Tenant','Landlord'].includes(b.role)) return bad('Enter a name, valid email, and role.');
 if (t.participants.some((p: any) => p.email.toLowerCase() === b.email.toLowerCase())) return bad('This participant is already added.');
 const data = JSON.parse(t.data); data.participants.push({ id: crypto.randomUUID(), name: b.name.slice(0, 100), email: b.email.toLowerCase(), role: b.role });
 await db().prepare('UPDATE transactions SET data = ? WHERE id = ?').bind(JSON.stringify(data), t.id).run(); await record(t.id, `${b.name} added as ${b.role}`); return Response.json({ ok: true });
 }
 const doc: any = await db().prepare('SELECT * FROM documents WHERE id = ? AND transaction_id = ?').bind(b.documentId, t.id).first();
 if (!doc) return bad('Document not found.', 404);
 if(b.action==='email'){
 if(typeof b.requestId!=='string'||!/^[a-zA-Z0-9-]{16,80}$/.test(b.requestId))return bad('Invalid email request.');
 let recipients:string[];
 try{recipients=emailRecipients(b.recipients,t.participants,doc);}catch(e){return bad((e as Error).message);}
 if(!config().RESEND_API_KEY)return bad('Email sending is not configured.',503);
 for(const recipient of recipients){
 try{await sendDocumentEmail(config().RESEND_API_KEY,doc,t.id,recipient,b.requestId);}catch{return bad(`Could not confirm email to ${recipient}. Retry with the same selection; already accepted messages will not be duplicated.`,502);}
 }
 await record(t.id,`${doc.name}: email accepted by Resend for ${recipients.join(', ')}`);
 return Response.json({ok:true});
 }
 if(b.action==='recipientEditing'){
 if(typeof b.enabled!=='boolean')return bad('Invalid permission.');
 const data=JSON.parse(t.data);data.recipientEditing={...data.recipientEditing,[doc.id]:b.enabled};
 const changed=await db().prepare('UPDATE transactions SET data = ? WHERE id = ? AND data = ?').bind(JSON.stringify(data),t.id,t.data).run();
 if(!changed.meta.changes)return bad('Transaction changed. Please retry.',409);
 await record(t.id,`${user.email} turned recipient field editing ${b.enabled?'on':'off'} for ${doc.name}`);return Response.json({ok:true});
 }
 if(b.action==='recipientFields'){
 if(t.isOwner||t.recipientEditing?.[doc.id]===false||doc.status!=='Awaiting signatures')return bad('Recipient editing is not available for this document.',403);
 if(JSON.stringify(b.baseFields)!==doc.fields)return bad('The document changed. Reopen it before editing.',409);
 const original=await bucket().get(doc.id);if(!original)return bad('Original PDF unavailable.',503);
 const source=await PDFDocument.load(await original.arrayBuffer());let updated;
 try{updated=recipientFields(JSON.parse(doc.fields),b.fields,user.email.toLowerCase(),source.getPageCount());}catch(e){return bad(e instanceof Error?e.message:'Invalid fields.');}
 const changed=await db().prepare("UPDATE documents SET fields = ? WHERE id = ? AND fields = ? AND status = 'Awaiting signatures' AND EXISTS (SELECT 1 FROM transactions WHERE id = ? AND data = ?)").bind(JSON.stringify(updated),doc.id,doc.fields,t.id,t.data).run();
 if(!changed.meta.changes)return bad('Fields or permissions changed. Reopen the document.',409);
 await record(t.id,`${user.email} adjusted their unfinished fields on ${doc.name}`);return Response.json({ok:true});
 }
 if (b.action === 'prepareRecipients') {
 const fields=JSON.parse(doc.fields);
 if (!['Draft','Awaiting signatures'].includes(doc.status)||fields.some((f:any)=>f.value!==''&&f.value!==null&&f.value!==undefined)) return bad('A document with completed fields cannot be reassigned.');
 if (!fields.length||!Array.isArray(b.assignments)||b.assignments.length!==fields.length||new Set(b.assignments.map((a:any)=>a.id)).size!==fields.length) return bad('Assign every field to a signer.');
 const emails=new Map(b.assignments.map((a:any)=>[a.id,typeof a.email==='string'?a.email.trim().toLowerCase():'']));
 if(fields.some((f:any)=>!emails.has(f.id)||!emails.get(f.id)||(emails.get(f.id)!==user.email.toLowerCase()&&!t.participants.some((p:any)=>p.email===emails.get(f.id)))))return bad('Add each recipient as a participant before assigning their fields.');
 const updated=fields.map((f:any)=>({...f,email:emails.get(f.id)}));
 const saved=await db().prepare("UPDATE documents SET fields = ?, status = 'Awaiting signatures' WHERE id = ? AND fields = ? AND status = ?").bind(JSON.stringify(updated),doc.id,doc.fields,doc.status).run();
 if(!saved.meta.changes)return bad('The document changed. Refresh before continuing.',409);
 await record(t.id,`${doc.name}: signing recipients saved`);return Response.json({ok:true});
 }
 if (b.action === 'fields') {
 if (doc.status !== 'Draft') return bad('Sent or signed documents are locked.');
 if (!Array.isArray(b.fields) || b.fields.length > 150 || b.fields.some((f: any) => !validFieldSize(f) || !['text','date','checkbox','initial','signature'].includes(f.type) || !Number.isInteger(f.page) || f.page < 1 || !Number.isFinite(f.x) || !Number.isFinite(f.y) || f.x < 0 || f.x > .75 || f.y < 0 || f.y > .95 || !f.id || typeof f.email !== 'string')) return bad('Invalid document fields.');
 const original = await bucket().get(doc.id); if (!original) return bad('Original PDF unavailable.', 503);
 const source = await PDFDocument.load(await original.arrayBuffer());
 if (b.fields.some((f: any) => f.page > source.getPageCount()) || new Set(b.fields.map((f: any)=>f.id)).size !== b.fields.length) return bad('Invalid page or duplicate field.');
 const saved = await db().prepare("UPDATE documents SET fields = ? WHERE id = ? AND status = 'Draft'").bind(JSON.stringify(b.fields.map((f: any) => ({ width:f.width??.24,height:f.height??.028,id: f.id, type: f.type, page: f.page, x: f.x, y: f.y, email: f.email.toLowerCase(), value: '' }))), doc.id).run();
 if (!saved.meta.changes) return bad('The document was just sent. Refresh before continuing.', 409);
 await record(t.id, `Fields saved on ${doc.name}`); return Response.json({ ok: true });
 }
 if (b.action === 'request') {
 const fields = JSON.parse(doc.fields);
 if (doc.status !== 'Draft' || !fields.length || fields.some((f: any) => !f.email || (f.email !== user.email.toLowerCase() && !t.participants.some((p: any) => p.email === f.email)))) return bad('Assign every field to a participant before requesting signatures.');
 const sent = await db().prepare("UPDATE documents SET status = 'Awaiting signatures' WHERE id = ? AND status = 'Draft' AND fields = ?").bind(doc.id, doc.fields).run();
 if (!sent.meta.changes) return bad('The document changed. Refresh before continuing.', 409);
 await record(t.id, `${doc.name} prepared for signing — invitation links ready to share`); return Response.json({ ok: true });
 }
 if (b.action === 'sign') {
 if (doc.status !== 'Awaiting signatures' || b.consent !== true || b.consentVersion !== TERMS_VERSION) return bad('This document is not ready to sign.');
 const fields = JSON.parse(doc.fields); const mine = fields.filter((f: any) => f.email === user.email.toLowerCase() && !f.value);
 if (!mine.length) return bad('No fields are assigned to your signed-in email.');
 const sourceFile=await bucket().get(doc.id);if(!sourceFile)return bad('Original PDF unavailable.',503);
 const sourceBytes=await sourceFile.arrayBuffer();
 const audit={eventId:crypto.randomUUID(),email:user.email,accountId:user.userId,signedAt:new Date().toISOString(),...requestEvidence(request),consentVersion:TERMS_VERSION,consentText:SIGNING_CONSENT,accountConsent:JSON.parse(accountConsent.message),originalPdfSha256:await hashBytes(sourceBytes),priorFieldStateSha256:await hashBytes(new TextEncoder().encode(doc.fields)),submittedEntries:mine.map((f:any)=>({fieldId:f.id,type:f.type,page:f.page,x:f.x,y:f.y,width:f.width??.24,height:f.height??.028,value:b.values?.[f.id]})),fieldIds:mine.map((f:any)=>f.id)};
 for (const f of mine) {
 const v = b.values?.[f.id]; if (f.type === 'checkbox' ? v !== true : typeof v !== 'string' || !v.trim() || v.length > 150 || /[^\x20-\x7E]/.test(v)) return bad('Complete all your fields using standard English characters.');
 f.value = v; f.signedAt = audit.signedAt; f.signedBy = user.userId; f.audit = audit;
 }
 const done = fields.every((f: any) => f.value);
 if (done) {
 const original = await bucket().get(doc.id); if (!original) return bad('Original PDF unavailable.', 503);
 const pdf = await PDFDocument.load(await original.arrayBuffer()); const font = await pdf.embedFont(StandardFonts.Helvetica); const cursive = await pdf.embedFont(StandardFonts.TimesRomanItalic);
 for (const f of fields) {
 const page = pdf.getPages()[f.page - 1]; if (!page) return bad('A field refers to a missing page.');
 const { width, height } = page.getSize(); const value = f.type === 'checkbox' ? 'X' : String(f.value);
 const face = ['signature','initial'].includes(f.type) ? cursive : font;
 const size = Math.min(14, Math.max(1,height*(f.height??.028)-6), Math.max(1,width*(f.width??.24)-6) / Math.max(face.widthOfTextAtSize(value, 1), 1));
 page.drawText(value, { x: f.x * width + 3, y: height - f.y * height - 3 - size, size, font: face, color: rgb(.08,.16,.25) });
 }
 await bucket().put(await signedKey(doc.id, JSON.stringify(fields)), await pdf.save(), { httpMetadata: { contentType: 'application/pdf' } });
 }
 const result = await db().prepare('UPDATE documents SET fields = ?, status = ? WHERE id = ? AND fields = ?').bind(JSON.stringify(fields), done ? 'Signed' : doc.status, doc.id, doc.fields).run();
 if (!result.meta.changes) return bad('Another signer just updated this document. Refresh and try again.', 409);
 await record(t.id, `${user.email} completed their fields on ${doc.name}${done ? ' — all signatures complete' : ''}`); return Response.json({ ok: true });
 }
 return bad('Unknown action.');
 } catch (e) { console.error(e); return bad('Your changes could not be saved. Please try again.', 503); }
}

