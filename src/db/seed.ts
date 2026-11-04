import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { z } from "zod";

import { homePageDefaults } from "../content/defaults/home";
import { collectionDefaults } from "../content/defaults/collections";
import { innerPageDefaults } from "../content/defaults/inner-pages";
import { sampleMedia } from "../content/defaults/sample-media";
import { settingsDefaults } from "../content/defaults/site";
import { buildValidator } from "../content/schemas";
import { collectionSchemas } from "../content/schemas/collections";
import { homePageSchema } from "../content/schemas/home";
import { innerPageSchemas } from "../content/schemas/inner-pages";
import { settingsSchema } from "../content/schemas/settings";
import { getMediaStorage } from "../lib/admin/storage";
import * as schema from "./schema";
import type { Database } from "./client";

const adminCredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(12),
});

export type SeedAdminConfig = {
  email?: string;
  password?: string;
  nodeEnv?: string;
};

export type AdminCredentials = {
  email: string;
  password: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sampleTextForConfirmation(topic: string) {
  const normalized = topic.toLowerCase();

  if (/subject|combination/.test(normalized)) {
    return "SAMPLE ONLY: illustrative subjects include English, Mathematics, Biology, Chemistry, Physics, Geography and History; these are not confirmed college offerings.";
  }
  if (/fee|charge|payment/.test(normalized)) {
    return "SAMPLE ONLY: no amount or payment instruction is provided; confirm all fees directly with the school.";
  }
  if (/date|calendar|deadline|year/.test(normalized)) {
    return "SAMPLE ONLY: this is not an official date or school calendar; contact the school for current dates.";
  }
  if (/email|phone|contact|map pin/.test(normalized)) {
    return "SAMPLE ONLY: use contact or location details supplied directly by the school.";
  }
  if (/privacy|legal|consent|retention|lawful|rights/.test(normalized)) {
    return "SAMPLE ONLY: this wording is not an approved legal, privacy or consent notice.";
  }
  if (/name|headmaster|biograph|leadership/.test(normalized)) {
    return "SAMPLE ONLY: current names, roles and biographies have not been verified.";
  }
  if (/club|event|sport|activity|publication/.test(normalized)) {
    return "SAMPLE ONLY: this is illustrative content, not a confirmed school event or activity.";
  }
  return "SAMPLE ONLY: this illustrative information has not been verified by the school.";
}

function replaceConfirmationMarkers(value: string) {
  return value.replace(
    /\[To be confirmed:\s*([^\]]+)\]/g,
    (_marker, topic: string) => sampleTextForConfirmation(topic),
  );
}

const placeholderTextPattern =
  /^(?:photo(?:graph)?(?: coming soon)?|portrait|staff portrait|old boy name|class, profession|name|role|year|achievement|one line|number of [a-z ]+|subjects practised|internet access|opening hours|draft\b.*|.*\bto be confirmed\b.*|.*\bbeing confirmed\b.*|.*\bwhen they have been confirmed\b.*|.*coming soon.*|.*\breplace before publishing\b.*|.*\breplace with approved photos\b.*)$/i;

const outdatedSeedText = new Set([
  "Boarders from across the region, with chapel, clubs and the school magazine.",
  "Sports on the school field",
  "The headmaster and the teachers who lead each department.",
  "Silver at the 2025 National Science Fair, and more to come.",
  "An association that gives back through labs, books and career talks.",
  "Meet the headmaster and the staff who support life and learning at Ombaci.",
  "Headmaster",
  "Science laboratory with students at work",
  "Photo · Science lab, students at work",
  "Students in the school quad",
  "Photo · Students in the quad",
  "Teachers in the staff room",
  "Photo · Teachers in the staff room",
  "Rugby action",
  "Rugby match in progress",
  "Medal ceremony",
  "Photo · Medal ceremony",
  "Old Boys' dinner",
  "Photo · Old Boys' dinner",
  "Portrait of the headmaster",
  "Featured Old Boy, portrait or at work",
  "Old Boy portrait",
  "Science team with their silver medal",
  "Photo · Science team, silver medal",
  "Regional science fair stand",
  "Photo · Regional fair stand",
  "Science laboratory, wide shot",
  "Library shelves and readers",
  "Trophy presentation",
  "Draft article to replace after the school approves the result details.",
  "Draft article combining the available 2025 science fair results.",
  "Example album awaiting school-supplied photos and consent.",
  "St. Joseph's Day is observed on 24 March.",
]);

export function mergeMissingDefaults(
  current: unknown,
  defaults: unknown,
  key?: string,
): unknown {
  if (Array.isArray(defaults)) {
    if (!Array.isArray(current)) return defaults;
    if (
      (key === "photos" || key === "facts") &&
      current.length === 0 &&
      defaults.length > 0
    ) {
      return defaults;
    }
    return current.map((value, index) =>
      index < defaults.length
        ? mergeMissingDefaults(value, defaults[index])
        : value,
    );
  }

  if (isRecord(defaults)) {
    const merged = isRecord(current) ? { ...current } : {};
    for (const [key, defaultValue] of Object.entries(defaults)) {
      merged[key] =
        merged[key] === undefined
          ? defaultValue
          : mergeMissingDefaults(merged[key], defaultValue, key);
    }
    return merged;
  }

  if (typeof current === "string") {
    if (/\[To be confirmed:/.test(current)) {
      const marker = /^\s*\[To be confirmed:[^\]]+\]\s*$/.test(current);
      if (marker && typeof defaults === "string") return defaults;
      return replaceConfirmationMarkers(current);
    }
    if (typeof defaults === "string" && outdatedSeedText.has(current.trim())) {
      return defaults;
    }
    if (
      typeof defaults === "string" &&
      defaults.trim() &&
      (!current.trim() || placeholderTextPattern.test(current.trim()))
    ) {
      return defaults;
    }
    return current;
  }

  return current === undefined ? defaults : current;
}

function invalidDefaultsError(name: string, error: z.ZodError) {
  const issues = error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  return new Error(`The ${name} defaults do not match their schema: ${issues}`);
}

function resolveSampleMediaReferences(
  value: unknown,
  mediaUrls?: Readonly<Record<string, string>>,
): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => resolveSampleMediaReferences(entry, mediaUrls));
  }
  if (!isRecord(value)) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (
        key === "src" &&
        typeof entry === "string" &&
        entry.startsWith("sample:") &&
        mediaUrls
      ) {
        const name = entry.slice("sample:".length);
        const url = mediaUrls[name];
        if (!url) throw new Error(`The sample photo "${name}" was not seeded.`);
        return [key, url];
      }

      return [key, resolveSampleMediaReferences(entry, mediaUrls)];
    }),
  );
}

async function encodeSampleImage(source: Buffer) {
  for (const [dimension, quality] of [
    [2000, 82],
    [1800, 74],
    [1600, 70],
    [1400, 68],
    [1200, 65],
  ]) {
    const processed = await sharp(source, {
      limitInputPixels: 40_000_000,
      failOn: "error",
    })
      .rotate()
      .resize({
        width: dimension,
        height: dimension,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer({ resolveWithObject: true });

    if (processed.data.byteLength < 300 * 1024) return processed;
  }

  throw new Error("A sample photo could not be reduced below 300 KB.");
}

async function seedSampleMedia(database: Database, timestamp: number) {
  const storage = getMediaStorage();
  const urls: Record<string, string> = {};

  for (const sample of sampleMedia) {
    const [existing] = await database
      .select()
      .from(schema.media)
      .where(eq(schema.media.id, sample.id))
      .limit(1);
    const source = await readFile(
      path.join(process.cwd(), "assets", "sample-images", sample.fileName),
    );
    const processed = await encodeSampleImage(source);
    if (existing) {
      if (existing.isSample && existing.sourceUrl === sample.sourceUrl) {
        const stored = await storage.save(sample.id, processed.data);
        await database
          .update(schema.media)
          .set({
            file: stored.key,
            width: processed.info.width,
            height: processed.info.height,
          })
          .where(eq(schema.media.id, sample.id));
        urls[sample.name] = stored.url;
      } else {
        urls[sample.name] = storage.url(existing.file);
      }
      continue;
    }

    const stored = await storage.save(sample.id, processed.data);
    try {
      await database.insert(schema.media).values({
        id: sample.id,
        file: stored.key,
        alt: sample.alt,
        width: processed.info.width,
        height: processed.info.height,
        credit: sample.credit,
        licence: "Pexels License",
        sourceUrl: sample.sourceUrl,
        isSample: true,
        hasPeople: sample.hasPeople,
        consentRecorded: false,
        focalPoint: { x: 0.5, y: 0.5 },
        createdAt: timestamp,
      });
    } catch (error) {
      try {
        await storage.remove(stored.key);
      } catch (cleanupError) {
        console.error(
          "Could not remove a sample photo after its database insert failed.",
          cleanupError,
        );
      }
      throw error;
    }

    urls[sample.name] = stored.url;
  }

  return urls;
}

export function validateDefaults(mediaUrls?: Readonly<Record<string, string>>) {
  const homeResult = buildValidator(homePageSchema).safeParse(
    resolveSampleMediaReferences(homePageDefaults, mediaUrls),
  );
  if (!homeResult.success) {
    throw invalidDefaultsError("Home page", homeResult.error);
  }

  const settingsResult = buildValidator(settingsSchema).safeParse(
    resolveSampleMediaReferences(settingsDefaults, mediaUrls),
  );
  if (!settingsResult.success) {
    throw invalidDefaultsError("Settings", settingsResult.error);
  }

  const pages = innerPageSchemas.map((pageSchema) => {
    const defaults = innerPageDefaults[pageSchema.key];
    if (!defaults) {
      throw new Error(`The ${pageSchema.label} defaults are missing.`);
    }
    const result = buildValidator(pageSchema).safeParse(
      resolveSampleMediaReferences(defaults, mediaUrls),
    );
    if (!result.success) {
      throw invalidDefaultsError(pageSchema.label, result.error);
    }
    return { schema: pageSchema, fields: result.data };
  });

  const collections = collectionSchemas.map((collectionSchema) => ({
    schema: collectionSchema,
    items: (collectionDefaults[collectionSchema.key] ?? []).map(
      (item, index) => {
        const result = buildValidator(collectionSchema).safeParse(
          resolveSampleMediaReferences(item.fields, mediaUrls),
        );
        if (!result.success) {
          throw invalidDefaultsError(
            `${collectionSchema.label} item ${item.slug}`,
            result.error,
          );
        }
        return {
          ...item,
          fields: result.data,
          sortOrder: index,
        };
      },
    ),
  }));

  return {
    home: homeResult.data,
    settings: settingsResult.data,
    pages,
    collections,
  };
}

export function parseSeedAdminConfig(
  config: SeedAdminConfig,
): AdminCredentials | null {
  const hasEmail = Boolean(config.email);
  const hasPassword = Boolean(config.password);

  if (!hasEmail && !hasPassword) return null;

  const nodeEnv = config.nodeEnv ?? "development";
  if (nodeEnv === "production") {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD cannot be used in production.",
    );
  }
  if (nodeEnv !== "development") {
    throw new Error("Seed admin credentials are accepted only in development.");
  }
  const email = config.email;
  const password = config.password;
  if (!email || !password) {
    throw new Error(
      "Set both SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create the development admin.",
    );
  }

  return adminCredentialsSchema.parse({
    email: email.trim().toLowerCase(),
    password,
  });
}

export async function seedContent(database: Database, timestamp = Date.now()) {
  const mediaUrls = await seedSampleMedia(database, timestamp);
  const defaults = validateDefaults(mediaUrls);

  await database
    .insert(schema.settings)
    .values(
      Object.entries(defaults.settings).map(([key, value]) => ({
        key,
        value,
        updatedAt: timestamp,
      })),
    )
    .onConflictDoNothing();

  for (const [key, value] of Object.entries(defaults.settings)) {
    const [existing] = await database
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, key))
      .limit(1);
    if (!existing) continue;

    const needsSampleUpgrade =
      typeof existing.value === "string" &&
      /\[To be confirmed:/.test(existing.value);
    const needsWhatsAppDefault =
      key === "whatsappNumber" &&
      typeof existing.value === "string" &&
      existing.value.trim() === "" &&
      typeof value === "string" &&
      value.trim() !== "";
    const needsLegacyPhoneUpgrade =
      key === "phone" &&
      existing.updatedBy === null &&
      existing.value === "+256 39 2001484";

    if (needsSampleUpgrade || needsWhatsAppDefault || needsLegacyPhoneUpgrade) {
      await database
        .update(schema.settings)
        .set({ value, updatedAt: timestamp })
        .where(eq(schema.settings.key, key));
    }
  }

  await database
    .insert(schema.pages)
    .values({
      key: homePageSchema.key,
      fields: defaults.home,
      status: "published",
      updatedAt: timestamp,
    })
    .onConflictDoNothing();

  const [existingHome] = await database
    .select()
    .from(schema.pages)
    .where(eq(schema.pages.key, homePageSchema.key))
    .limit(1);
  if (existingHome) {
    const mergedFields = mergeMissingDefaults(
      existingHome.fields,
      defaults.home,
    );
    const validated = buildValidator(homePageSchema).safeParse(mergedFields);
    if (!validated.success) {
      throw new Error(
        `The saved Home page cannot be updated with current defaults: ${validated.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ")}`,
      );
    }

    await database
      .update(schema.pages)
      .set({ fields: validated.data })
      .where(eq(schema.pages.key, homePageSchema.key));
  }

  for (const { schema: pageSchema, fields } of defaults.pages) {
    await database
      .insert(schema.pages)
      .values({
        key: pageSchema.key,
        fields,
        status: "published",
        updatedAt: timestamp,
      })
      .onConflictDoNothing();

    const [existing] = await database
      .select()
      .from(schema.pages)
      .where(eq(schema.pages.key, pageSchema.key))
      .limit(1);
    if (!existing) continue;

    const mergedFields = mergeMissingDefaults(existing.fields, fields);
    const validated = buildValidator(pageSchema).safeParse(mergedFields);
    if (!validated.success) {
      throw new Error(
        `The saved ${pageSchema.label} page cannot be updated with current defaults: ${validated.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ")}`,
      );
    }

    await database
      .update(schema.pages)
      .set({ fields: validated.data })
      .where(eq(schema.pages.key, pageSchema.key));
  }

  for (const {
    schema: collectionSchema,
    items: collectionItems,
  } of defaults.collections) {
    if (collectionItems.length === 0) continue;

    await database
      .insert(schema.items)
      .values(
        collectionItems.map((item) => ({
          id: `default:${collectionSchema.key}:${item.slug}`,
          collection: collectionSchema.key,
          slug: item.slug,
          fields: item.fields,
          status: item.status ?? "published",
          sortOrder: item.sortOrder,
          updatedAt: timestamp,
        })),
      )
      .onConflictDoNothing();

    for (const item of collectionItems) {
      const id = `default:${collectionSchema.key}:${item.slug}`;
      const [existing] = await database
        .select()
        .from(schema.items)
        .where(eq(schema.items.id, id))
        .limit(1);
      if (!existing) continue;

      const mergedFields = mergeMissingDefaults(existing.fields, item.fields);
      const validated =
        buildValidator(collectionSchema).safeParse(mergedFields);
      if (!validated.success) {
        throw new Error(
          `The saved ${collectionSchema.label} entry "${item.slug}" cannot be updated with current defaults: ${validated.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("; ")}`,
        );
      }

      await database
        .update(schema.items)
        .set({ fields: validated.data })
        .where(eq(schema.items.id, id));
    }
  }
}

export async function seedDevelopmentAdmin(
  database: Database,
  config: SeedAdminConfig,
): Promise<"skipped" | "created" | "already-exists"> {
  const credentials = parseSeedAdminConfig(config);
  if (!credentials) return "skipped";

  const existing = await database
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, credentials.email))
    .limit(1);

  if (existing.length > 0) return "already-exists";

  const now = Date.now();
  const passwordHash = await argon2.hash(credentials.password, {
    type: argon2.argon2id,
  });

  const inserted = await database
    .insert(schema.users)
    .values({
      id: randomUUID(),
      email: credentials.email,
      passwordHash,
      role: "admin",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .returning({ id: schema.users.id });

  return inserted.length > 0 ? "created" : "already-exists";
}
