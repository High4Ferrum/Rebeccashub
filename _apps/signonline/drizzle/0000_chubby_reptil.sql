CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`status` text NOT NULL,
	`fields` text DEFAULT '[]' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_documents_transaction` ON `documents` (`transaction_id`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`message` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_events_transaction` ON `events` (`transaction_id`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_transactions_owner` ON `transactions` (`owner`);