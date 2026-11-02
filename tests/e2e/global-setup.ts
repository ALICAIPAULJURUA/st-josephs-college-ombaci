import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import argon2 from "argon2";
import { migrate } from "drizzle-orm/libsql/migrator";

import { ensureLocalDatabaseDirectory } from "../../src/db/local-file";
import { seedContent, seedDevelopmentAdmin } from "../../src/db/seed";
import { chatLog, settings, users } from "../../src/db/schema";
import { E2E_DATABASE_URL, E2E_USERS } from "./constants";

export async function cleanupE2EDatabase() {
  const databaseUrl = process.env.E2E_DATABASE_URL ?? E2E_DATABASE_URL;
  if (!databaseUrl.startsWith("file:")) {
    throw new Error("The E2E database must use a local SQLite file.");
  }
  const testDatabasePath = resolve(databaseUrl.slice("file:".length));
  await Promise.all(
    ["", "-shm", "-wal"].map((suffix) =>
      rm(`${testDatabasePath}${suffix}`, { force: true }),
    ),
  );
}

export default async function globalSetup() {
  await ensureLocalDatabaseDirectory("file:./data/site.db");
  const databaseUrl = process.env.E2E_DATABASE_URL ?? E2E_DATABASE_URL;
  await ensureLocalDatabaseDirectory(databaseUrl);
  await cleanupE2EDatabase();
  const { client: defaultClient, createDatabase } = await import(
    "../../src/db/client"
  );
  await defaultClient.close();
  const { client, db } = createDatabase(databaseUrl);

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
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
