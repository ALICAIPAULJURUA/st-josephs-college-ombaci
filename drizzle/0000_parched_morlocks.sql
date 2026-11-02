CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`fields` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_log` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`answered` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`fields` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`collection` text NOT NULL,
	`slug` text NOT NULL,
	`fields` text NOT NULL,
	`status` text DEFAULT 'hidden' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`publish_at` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `items_collection_slug_unique` ON `items` (`collection`,`slug`);--> statement-breakpoint
CREATE INDEX `items_collection_status_sort_order` ON `items` (`collection`,`status`,`sort_order`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`file` text NOT NULL,
	`alt` text NOT NULL,
	`width` integer,
	`height` integer,
	`credit` text,
	`licence` text,
	`source_url` text,
	`is_sample` integer DEFAULT false NOT NULL,
	`has_people` integer DEFAULT false NOT NULL,
	`consent_recorded` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`key` text PRIMARY KEY NOT NULL,
	`fields` text NOT NULL,
	`status` text DEFAULT 'hidden' NOT NULL,
	`updated_by` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`record_type` text NOT NULL,
	`record_id` text NOT NULL,
	`snapshot` text NOT NULL,
	`user` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `revisions_record_created_at` ON `revisions` (`record_type`,`record_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_by` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'editor' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);