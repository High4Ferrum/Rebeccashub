export function recipientFields(original: any[], proposed: any[], email: string, pages: number) {
 if(!Array.isArray(proposed)||proposed.length>150)throw Error('Too many fields.');
 const ids=new Set<string>();const old=new Map(original.map(f=>[f.id,f]));
 const editable=(f:any)=>f.email===email&&!f.value&&!f.signedAt&&!f.signedBy;
 for(const f of original)if(!editable(f)&&!proposed.some(p=>p&&p.id===f.id&&JSON.stringify(p)===JSON.stringify(f)))throw Error('Other signers’ fields and completed entries are locked.');
 return proposed.map(f=>{
 if(!f||typeof f.id!=='string'||!f.id||f.id.length>100||ids.has(f.id))throw Error('Invalid field identifier.');ids.add(f.id);
 const previous=old.get(f.id);if(previous&&!editable(previous))return previous;
 if(f.email!==email||f.value||f.signedAt||f.signedBy)throw Error('You can edit only your own unfinished fields.');
 if(!['text','date','checkbox','initial','signature'].includes(f.type)||!Number.isInteger(f.page)||f.page<1||f.page>pages||!Number.isFinite(f.x)||!Number.isFinite(f.y)||f.x<0||f.x>.75||f.y<0||f.y>.95)throw Error('Invalid field position.');
 return {id:f.id,type:f.type,page:f.page,x:f.x,y:f.y,email,value:''};
 });
}
