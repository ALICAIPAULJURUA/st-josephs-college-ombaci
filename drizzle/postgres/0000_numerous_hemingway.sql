CREATE TABLE "application_files" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"storage_key" text NOT NULL,
	"field_name" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_status_history" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"status" text NOT NULL,
	"actor_id" text,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"fields" jsonb NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_log" (
	"id" text PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answered" boolean DEFAULT false NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"window_started_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"fields" jsonb NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" text PRIMARY KEY NOT NULL,
	"collection" text NOT NULL,
	"slug" text NOT NULL,
	"fields" jsonb NOT NULL,
	"status" text DEFAULT 'hidden' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"publish_at" bigint,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"key" text PRIMARY KEY NOT NULL,
	"failures" integer DEFAULT 0 NOT NULL,
	"window_started_at" bigint NOT NULL,
	"locked_until" bigint
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY NOT NULL,
	"file" text NOT NULL,
	"alt" text NOT NULL,
	"width" integer,
	"height" integer,
	"credit" text,
	"licence" text,
	"source_url" text,
	"is_sample" boolean DEFAULT false NOT NULL,
	"has_people" boolean DEFAULT false NOT NULL,
	"consent_recorded" boolean DEFAULT false NOT NULL,
	"focal_point" jsonb,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"key" text PRIMARY KEY NOT NULL,
	"fields" jsonb NOT NULL,
	"draft_fields" jsonb,
	"draft_updated_by" text,
	"draft_updated_at" bigint,
	"status" text DEFAULT 'hidden' NOT NULL,
	"updated_by" text,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redirects" (
	"source" text PRIMARY KEY NOT NULL,
	"destination" text NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"record_type" text NOT NULL,
	"record_id" text NOT NULL,
	"snapshot" jsonb NOT NULL,
	"user" text,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" text,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"window_started_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'editor' NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "application_files" ADD CONSTRAINT "application_files_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "application_files_application" ON "application_files" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_status_history_application" ON "application_status_history" USING btree ("application_id","created_at");--> statement-breakpoint
CREATE INDEX "chat_log_created_at" ON "chat_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "items_collection_slug_unique" ON "items" USING btree ("collection","slug");--> statement-breakpoint
CREATE INDEX "items_collection_status_sort_order" ON "items" USING btree ("collection","status","sort_order");--> statement-breakpoint
CREATE INDEX "revisions_record_created_at" ON "revisions" USING btree ("record_type","record_id","created_at");