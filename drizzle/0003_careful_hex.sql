CREATE TABLE `redirects` (
	`source` text PRIMARY KEY NOT NULL,
	`destination` text NOT NULL,
	`created_at` integer NOT NULL
);
