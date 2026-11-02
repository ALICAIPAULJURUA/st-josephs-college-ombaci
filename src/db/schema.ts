import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role")
    .$type<"admin" | "editor" | "admissions">()
    .notNull()
    .default("editor"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const loginAttempts = sqliteTable("login_attempts", {
  key: text("key").primaryKey(),
  failures: integer("failures").notNull().default(0),
  windowStartedAt: integer("window_started_at").notNull(),
  lockedUntil: integer("locked_until"),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).$type<unknown>().notNull(),
  updatedBy: text("updated_by"),
  updatedAt: integer("updated_at").notNull(),
});

export const pages = sqliteTable("pages", {
  key: text("key").primaryKey(),
  fields: text("fields", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
  draftFields: text("draft_fields", { mode: "json" }).$type<
    Record<string, unknown>
  >(),
  draftUpdatedBy: text("draft_updated_by"),
  draftUpdatedAt: integer("draft_updated_at"),
  status: text("status")
    .$type<"published" | "hidden">()
    .notNull()
    .default("hidden"),
  updatedBy: text("updated_by"),
  updatedAt: integer("updated_at").notNull(),
});

export const items = sqliteTable(
  "items",
  {
    id: text("id").primaryKey(),
    collection: text("collection").notNull(),
    slug: text("slug").notNull(),
    fields: text("fields", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull(),
    status: text("status")
      .$type<"published" | "hidden">()
      .notNull()
      .default("hidden"),
    sortOrder: integer("sort_order").notNull().default(0),
    publishAt: integer("publish_at"),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("items_collection_slug_unique").on(
      table.collection,
      table.slug,
    ),
    index("items_collection_status_sort_order").on(
      table.collection,
      table.status,
      table.sortOrder,
    ),
  ],
);

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  file: text("file").notNull(),
  alt: text("alt").notNull(),
  width: integer("width"),
  height: integer("height"),
  credit: text("credit"),
  licence: text("licence"),
  sourceUrl: text("source_url"),
  isSample: integer("is_sample", { mode: "boolean" }).notNull().default(false),
  hasPeople: integer("has_people", { mode: "boolean" })
    .notNull()
    .default(false),
  consentRecorded: integer("consent_recorded", { mode: "boolean" })
    .notNull()
    .default(false),
  focalPoint: text("focal_point", { mode: "json" }).$type<{
    x: number;
    y: number;
  }>(),
  createdAt: integer("created_at").notNull(),
});

export const revisions = sqliteTable(
  "revisions",
  {
    id: text("id").primaryKey(),
    recordType: text("record_type").notNull(),
    recordId: text("record_id").notNull(),
    snapshot: text("snapshot", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull(),
    user: text("user"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("revisions_record_created_at").on(
      table.recordType,
      table.recordId,
      table.createdAt,
    ),
  ],
);

export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(),
  status: text("status")
    .$type<
      | "new"
      | "in_review"
      | "interview_invited"
      | "offer_made"
      | "declined"
      | "closed"
    >()
    .notNull()
    .default("new"),
  fields: text("fields", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const applicationStatusHistory = sqliteTable(
  "application_status_history",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    status: text("status")
      .$type<
        | "new"
        | "in_review"
        | "interview_invited"
        | "offer_made"
        | "declined"
        | "closed"
      >()
      .notNull(),
    actorId: text("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("application_status_history_application").on(table.applicationId, table.createdAt)],
);

export const applicationFiles = sqliteTable(
  "application_files",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    fieldName: text("field_name").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("application_files_application").on(table.applicationId),
  ],
);

export const enquiries = sqliteTable("enquiries", {
  id: text("id").primaryKey(),
  fields: text("fields", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
  createdAt: integer("created_at").notNull(),
});

export const submissionRateLimits = sqliteTable("submission_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStartedAt: integer("window_started_at").notNull(),
});

export const chatLog = sqliteTable("chat_log", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  answered: integer("answered", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("chat_log_created_at").on(table.createdAt)]);

export const chatRateLimits = sqliteTable("chat_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStartedAt: integer("window_started_at").notNull(),
});

export const redirects = sqliteTable("redirects", {
  source: text("source").primaryKey(),
  destination: text("destination").notNull(),
  createdAt: integer("created_at").notNull(),
});
