import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
export const transactions = sqliteTable('transactions', {
 id: text('id').primaryKey(), owner: text('owner').notNull(), data: text('data').notNull(), created: text('created').notNull()
}, t => [index('idx_transactions_owner').on(t.owner)]);
export const documents = sqliteTable('documents', {
 id: text('id').primaryKey(), transactionId: text('transaction_id').notNull(), name: text('name').notNull(), category: text('category').notNull(), status: text('status').notNull(), fields: text('fields').notNull().default('[]'), created: text('created').notNull()
}, t => [index('idx_documents_transaction').on(t.transactionId)]);
export const events = sqliteTable('events', {
 id: text('id').primaryKey(), transactionId: text('transaction_id').notNull(), message: text('message').notNull(), created: text('created').notNull()
}, t => [index('idx_events_transaction').on(t.transactionId)]);
