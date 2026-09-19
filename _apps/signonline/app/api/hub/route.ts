import { getAppUser as getChatGPTUser, config } from '@/lib/auth';
import { db, bucket, record } from '@/lib/storage';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
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
 const q = new URL(request.url).searchParams;
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
 if (request.headers.get('content-type')?.includes('multipart/form-data')) {
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
 if (b.action === 'create') {
 if (process.env.NODE_ENV !== 'development' && (!config().WORKSPACE_OWNER_EMAIL || user.email.toLowerCase() !== config().WORKSPACE_OWNER_EMAIL.toLowerCase())) return bad('Only the workspace owner can create transactions.', 403);
 if (!b.address?.trim() || !['Sale','Purchase','Lease'].includes(b.type)) return bad('Enter an address and transaction type.');
 const id = crypto.randomUUID(); const data = { address: b.address.trim().slice(0, 180), city: String(b.city || '').slice(0, 160), type: b.type, price: String(b.price || ''), closing: b.closing || '', stage: 'In progress', participants: [] };
 await db().prepare('INSERT INTO transactions (id, owner, data, created) VALUES (?, ?, ?, ?)').bind(id, user.userId, JSON.stringify(data), new Date().toISOString()).run();
 await record(id, 'Transaction workspace created'); return Response.json({ id });
 }
 const t = await transaction(b.transactionId, user, b.action !== 'sign'); if (!t) return bad('Transaction not found.', 404);
 if (b.action === 'participant') {
 if (!b.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) || !['Buyer','Seller','Buyer agent','Seller agent','Tenant','Landlord'].includes(b.role)) return bad('Enter a name, valid email, and role.');
 if (t.participants.some((p: any) => p.email.toLowerCase() === b.email.toLowerCase())) return bad('This participant is already added.');
 const data = JSON.parse(t.data); data.participants.push({ id: crypto.randomUUID(), name: b.name.slice(0, 100), email: b.email.toLowerCase(), role: b.role });
 await db().prepare('UPDATE transactions SET data = ? WHERE id = ?').bind(JSON.stringify(data), t.id).run(); await record(t.id, `${b.name} added as ${b.role}`); return Response.json({ ok: true });
 }
 const doc: any = await db().prepare('SELECT * FROM documents WHERE id = ? AND transaction_id = ?').bind(b.documentId, t.id).first();
 if (!doc) return bad('Document not found.', 404);
 if (b.action === 'fields') {
 if (doc.status !== 'Draft') return bad('Sent or signed documents are locked.');
 if (!Array.isArray(b.fields) || b.fields.length > 150 || b.fields.some((f: any) => !['text','date','checkbox','initial','signature'].includes(f.type) || !Number.isInteger(f.page) || f.page < 1 || !Number.isFinite(f.x) || !Number.isFinite(f.y) || f.x < 0 || f.x > .75 || f.y < 0 || f.y > .95 || !f.id || typeof f.email !== 'string')) return bad('Invalid document fields.');
 const original = await bucket().get(doc.id); if (!original) return bad('Original PDF unavailable.', 503);
 const source = await PDFDocument.load(await original.arrayBuffer());
 if (b.fields.some((f: any) => f.page > source.getPageCount()) || new Set(b.fields.map((f: any)=>f.id)).size !== b.fields.length) return bad('Invalid page or duplicate field.');
 const saved = await db().prepare("UPDATE documents SET fields = ? WHERE id = ? AND status = 'Draft'").bind(JSON.stringify(b.fields.map((f: any) => ({ id: f.id, type: f.type, page: f.page, x: f.x, y: f.y, email: f.email.toLowerCase(), value: '' }))), doc.id).run();
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
 if (doc.status !== 'Awaiting signatures' || b.consent !== true) return bad('This document is not ready to sign.');
 const fields = JSON.parse(doc.fields); const mine = fields.filter((f: any) => f.email === user.email.toLowerCase() && !f.value);
 if (!mine.length) return bad('No fields are assigned to your signed-in email.');
 for (const f of mine) {
 const v = b.values?.[f.id]; if (f.type === 'checkbox' ? v !== true : typeof v !== 'string' || !v.trim() || v.length > 150 || /[^\x20-\x7E]/.test(v)) return bad('Complete all your fields using standard English characters.');
 f.value = v; f.signedAt = new Date().toISOString(); f.signedBy = user.userId;
 }
 const done = fields.every((f: any) => f.value);
 if (done) {
 const original = await bucket().get(doc.id); if (!original) return bad('Original PDF unavailable.', 503);
 const pdf = await PDFDocument.load(await original.arrayBuffer()); const font = await pdf.embedFont(StandardFonts.Helvetica); const cursive = await pdf.embedFont(StandardFonts.TimesRomanItalic);
 for (const f of fields) {
 const page = pdf.getPages()[f.page - 1]; if (!page) return bad('A field refers to a missing page.');
 const { width, height } = page.getSize(); const value = f.type === 'checkbox' ? 'X' : String(f.value);
 const face = ['signature','initial'].includes(f.type) ? cursive : font;
 const size = Math.min(14, (width * .23) / Math.max(face.widthOfTextAtSize(value, 1), 1));
 page.drawText(value, { x: f.x * width + 3, y: height - f.y * height - 18, size, font: face, color: rgb(.08,.16,.25) });
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
