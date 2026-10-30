import {
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("editor"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
  updatedBy: text("updated_by"),
  updatedAt: integer("updated_at").notNull(),
});

export const pages = sqliteTable("pages", {
  key: text("key").primaryKey(),
  fields: text("fields", { mode: "json" }).notNull(),
  status: text("status").notNull().default("hidden"),
  updatedBy: text("updated_by"),
  updatedAt: integer("updated_at").notNull(),
});

export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  collection: text("collection").notNull(),
  slug: text("slug").notNull(),
  fields: text("fields", { mode: "json" }).notNull(),
  status: text("status").notNull().default("hidden"),
  sortOrder: integer("sort_order").notNull().default(0),
  publishAt: integer("publish_at"),
  updatedAt: integer("updated_at").notNull(),
});

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
  hasPeople: integer("has_people", { mode: "boolean" }).notNull().default(false),
  consentRecorded: integer("consent_recorded", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
});

export const revisions = sqliteTable("revisions", {
  id: text("id").primaryKey(),
  recordType: text("record_type").notNull(),
  recordId: text("record_id").notNull(),
  snapshot: text("snapshot", { mode: "json" }).notNull(),
  user: text("user"),
  createdAt: integer("created_at").notNull(),
});

export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(),
  status: text("status").notNull().default("new"),
  fields: text("fields", { mode: "json" }).notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const enquiries = sqliteTable("enquiries", {
  id: text("id").primaryKey(),
  fields: text("fields", { mode: "json" }).notNull(),
  createdAt: integer("created_at").notNull(),
});

export const chatLog = sqliteTable("chat_log", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  answered: integer("answered", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
});
