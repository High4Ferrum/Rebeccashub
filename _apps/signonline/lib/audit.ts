import { PDFDocument, StandardFonts } from 'pdf-lib';
export async function hashBytes(bytes: Uint8Array | ArrayBuffer) {
 const digest=await crypto.subtle.digest('SHA-256',bytes as BufferSource);
 return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
export function requestEvidence(request:Request){
 return {ipAddress:process.env.NODE_ENV==='production'?request.headers.get('cf-connecting-ip')?.slice(0,64)||null:null,browser:request.headers.get('user-agent')?.slice(0,512)||null};
}
export async function auditPdf(report:unknown){
 const pdf=await PDFDocument.create();const font=await pdf.embedFont(StandardFonts.Courier);let page=pdf.addPage(),y=800;
 const text=JSON.stringify(report,null,2).replace(/[^\x20-\x7E\n]/g,'?');
 for(const line of text.split('\n'))for(let offset=0;offset<Math.max(1,line.length);offset+=86){if(y<40){page=pdf.addPage();y=800;}page.drawText(line.slice(offset,offset+86),{x:35,y,size:9,font});y-=13;}
 return pdf.save();
}
