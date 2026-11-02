import { readdir, mkdir, stat, unlink } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

import { createDatabase } from "../src/db/client";

const databaseUrl = process.env.DATABASE_URL || "file:./data/site.db";
if (!databaseUrl.startsWith("file:")) {
  throw new Error(
    "Local SQLite backup requires DATABASE_URL to use the file: scheme.",
  );
}

const databasePath = databaseUrl.slice("file:".length);
if (!databasePath || databasePath.startsWith(":")) {
  throw new Error("DATABASE_URL must point to a local SQLite database file.");
}

const sourcePath = resolve(databasePath);
const backupDirectory = join(dirname(sourcePath), "backups");
const generatedAt = new Date();
const fileTimestamp = generatedAt.toISOString().replace(/[:.]/g, "-");
const backupPath = join(backupDirectory, `site-${fileTimestamp}.sqlite`);
const backupUrl = `file:./${relative(process.cwd(), backupPath).replaceAll("\\", "/")}`;
const database = createDatabase(databaseUrl);

try {
  await mkdir(backupDirectory, { recursive: true });
  const escapedPath = backupPath.replaceAll("'", "''");
  await database.client.execute(`VACUUM INTO '${escapedPath}'`);

  const backupDatabase = createDatabase(backupUrl);
  try {
    const result = await backupDatabase.client.execute(
      "PRAGMA integrity_check",
    );
    if (result.rows[0]?.integrity_check !== "ok") {
      throw new Error("The new SQLite backup failed its integrity check.");
    }
  } finally {
    await backupDatabase.client.close();
  }

  const retentionCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const oldBackups = await readdir(backupDirectory, { withFileTypes: true });
  for (const entry of oldBackups) {
    if (
      !entry.isFile() ||
      !/^site-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.sqlite$/.test(
        entry.name,
      )
    ) {
      continue;
    }

    const path = join(backupDirectory, entry.name);
    if ((await stat(path)).mtimeMs < retentionCutoff) {
      await unlink(path);
    }
  }

  console.log(`Created and verified SQLite backup: ${backupPath}`);
  console.log("Backups older than 30 days were removed.");
} finally {
  await database.client.close();
}
