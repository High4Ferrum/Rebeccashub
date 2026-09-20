type MailDocument = { id: string; name: string; status: string; fields: string };
export function emailRecipients(input: unknown, participants: {email:string}[], doc: MailDocument): string[] {
 if (!['Awaiting signatures','Signed'].includes(doc.status)) throw new Error('Prepare the document before sending email.');
 if (!Array.isArray(input)||!input.length||input.length>10||input.some(e=>typeof e!=='string')) throw new Error('Select 1–10 recipients.');
 const emails=[...new Set(input.map(e=>e.trim().toLowerCase()))];
 const fields=JSON.parse(doc.fields);
 if(emails.some(e=>!participants.some(p=>p.email.toLowerCase()===e)||(doc.status!=='Signed'&&!fields.some((f:{email:string})=>f.email===e)))) throw new Error('Each recipient must be a participant assigned to this document.');
 return emails.sort();
}
export async function sendDocumentEmail(key:string, doc:MailDocument, transactionId:string, recipient:string, requestId:string) {
 if(!key)throw new Error('Email sending is not configured.');
 const completed=doc.status==='Signed';
 const link=`https://signonline.rebeccayener.com/?transaction=${encodeURIComponent(transactionId)}`;
 const text=`${completed?'Your completed document is ready to download':'You have a document to review and sign'}: ${doc.name}\n\nOpen your transaction: ${link}\n\nSign in using ${recipient}. Then open ${doc.name}.${completed?' Use Download signed PDF to save your copy.':''}\n\nSignOnline`;
 const payload={from:'SignOnline <signonline@notify.rebeccayener.com>',to:[recipient],reply_to:'me@rebeccayener.com',subject:completed?'SignOnline: completed document':'SignOnline: signature requested',text};
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([doc.id,requestId,payload])));
 const idempotency=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':idempotency},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
 if(!response.ok){await response.body?.cancel();throw new Error('Email provider did not accept the message. Retry shortly or check the Resend dashboard.');}
 const result=await response.json() as {id?:string};
 if(!result.id)throw new Error('Email confirmation was unavailable. Retry this request.');
 return result.id;
}
