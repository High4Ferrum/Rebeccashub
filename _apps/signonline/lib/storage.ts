import { env } from 'cloudflare:workers';
export const db = () => (env as unknown as { DB: D1Database }).DB;
export const bucket = () => (env as unknown as { BUCKET: R2Bucket }).BUCKET;
export async function record(transactionId: string, message: string) {
 await db().prepare('INSERT INTO events (id, transaction_id, message, created) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), transactionId, message, new Date().toISOString()).run();
}
