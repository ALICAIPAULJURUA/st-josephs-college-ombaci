import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamp = (name: string) => bigint(name, { mode: "number" });

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role")
    .$type<"admin" | "editor" | "admissions">()
    .notNull()
    .default("editor"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const loginAttempts = pgTable("login_attempts", {
  key: text("key").primaryKey(),
  failures: integer("failures").notNull().default(0),
  windowStartedAt: timestamp("window_started_at").notNull(),
  lockedUntil: timestamp("locked_until"),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at").notNull(),
});

export const pages = pgTable("pages", {
  key: text("key").primaryKey(),
  fields: jsonb("fields").$type<Record<string, unknown>>().notNull(),
  draftFields: jsonb("draft_fields").$type<Record<string, unknown>>(),
  draftUpdatedBy: text("draft_updated_by"),
  draftUpdatedAt: timestamp("draft_updated_at"),
  status: text("status")
    .$type<"published" | "hidden">()
    .notNull()
    .default("hidden"),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at").notNull(),
});

export const items = pgTable(
  "items",
  {
    id: text("id").primaryKey(),
    collection: text("collection").notNull(),
    slug: text("slug").notNull(),
    fields: jsonb("fields").$type<Record<string, unknown>>().notNull(),
    status: text("status")
      .$type<"published" | "hidden">()
      .notNull()
      .default("hidden"),
    sortOrder: integer("sort_order").notNull().default(0),
    publishAt: timestamp("publish_at"),
    updatedAt: timestamp("updated_at").notNull(),
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

export const media = pgTable("media", {
  id: text("id").primaryKey(),
  file: text("file").notNull(),
  alt: text("alt").notNull(),
  width: integer("width"),
  height: integer("height"),
  credit: text("credit"),
  licence: text("licence"),
  sourceUrl: text("source_url"),
  isSample: boolean("is_sample").notNull().default(false),
  hasPeople: boolean("has_people").notNull().default(false),
  consentRecorded: boolean("consent_recorded").notNull().default(false),
  focalPoint: jsonb("focal_point").$type<{ x: number; y: number }>(),
  createdAt: timestamp("created_at").notNull(),
});

export const revisions = pgTable(
  "revisions",
  {
    id: text("id").primaryKey(),
    recordType: text("record_type").notNull(),
    recordId: text("record_id").notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    user: text("user"),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    index("revisions_record_created_at").on(
      table.recordType,
      table.recordId,
      table.createdAt,
    ),
  ],
);

export const applications = pgTable("applications", {
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
  fields: jsonb("fields").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const applicationStatusHistory = pgTable(
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
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    index("application_status_history_application").on(
      table.applicationId,
      table.createdAt,
    ),
  ],
);

export const applicationFiles = pgTable(
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
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [index("application_files_application").on(table.applicationId)],
);

export const enquiries = pgTable("enquiries", {
  id: text("id").primaryKey(),
  fields: jsonb("fields").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const submissionRateLimits = pgTable("submission_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStartedAt: timestamp("window_started_at").notNull(),
});

export const chatLog = pgTable(
  "chat_log",
  {
    id: text("id").primaryKey(),
    question: text("question").notNull(),
    answered: boolean("answered").notNull().default(false),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [index("chat_log_created_at").on(table.createdAt)],
);

export const chatRateLimits = pgTable("chat_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStartedAt: timestamp("window_started_at").notNull(),
});

export const redirects = pgTable("redirects", {
  source: text("source").primaryKey(),
  destination: text("destination").notNull(),
  createdAt: timestamp("created_at").notNull(),
});
