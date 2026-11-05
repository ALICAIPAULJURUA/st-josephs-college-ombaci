import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import argon2 from "argon2";

import { ensureLocalDatabaseDirectory } from "../../src/db/local-file";
import { migrateDatabase } from "../../src/db/migrations";
import { seedContent, seedDevelopmentAdmin } from "../../src/db/seed";
import { chatLog, settings, users } from "../../src/db/schema";
import { E2E_DATABASE_URL, E2E_USERS } from "./constants";

export async function cleanupE2EDatabase() {
  const databaseUrl = process.env.E2E_DATABASE_URL ?? E2E_DATABASE_URL;
  if (!databaseUrl.startsWith("pglite:")) {
    throw new Error("The E2E database must use a local PGlite directory.");
  }
  const testDatabasePath = resolve(databaseUrl.slice("pglite:".length));
  if (!testDatabasePath.startsWith(resolve("data", "site-e2e-"))) {
    throw new Error("Refusing to remove a database outside the E2E data path.");
  }
  await rm(testDatabasePath, { recursive: true, force: true });
}

export default async function globalSetup() {
  await ensureLocalDatabaseDirectory("pglite:./data/postgres");
  const databaseUrl = process.env.E2E_DATABASE_URL ?? E2E_DATABASE_URL;
  await ensureLocalDatabaseDirectory(databaseUrl);
  await cleanupE2EDatabase();
  const { client: defaultClient, createDatabase } =
    await import("../../src/db/client");
  await defaultClient.close();
  await migrateDatabase(databaseUrl);
  const { client, db } = createDatabase(databaseUrl);

  try {
    await seedContent(db);
    await db
      .insert(settings)
      .values({
        key: "applicationsOpen",
        value: true,
        updatedBy: "playwright",
        updatedAt: Date.now(),
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value: true,
          updatedBy: "playwright",
          updatedAt: Date.now(),
        },
      });
    await db.insert(chatLog).values({
      id: randomUUID(),
      question: "E2E sample question for the assistant dashboard.",
      answered: false,
      createdAt: Date.now(),
    });
    await seedDevelopmentAdmin(db, {
      ...E2E_USERS.admin,
      nodeEnv: "development",
    });

    for (const [role, credentials] of [
      ["editor", E2E_USERS.editor],
      ["admissions", E2E_USERS.admissions],
    ] as const) {
      const passwordHash = await argon2.hash(credentials.password, {
        type: argon2.argon2id,
      });
      await db
        .insert(users)
        .values({
          id: randomUUID(),
          email: credentials.email,
          passwordHash,
          role,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .onConflictDoNothing();
    }
  } finally {
    await client.close();
  }
}
