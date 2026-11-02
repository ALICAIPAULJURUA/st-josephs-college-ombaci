CREATE TABLE `chat_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`window_started_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `chat_log_created_at` ON `chat_log` (`created_at`);