import { migrate } from "drizzle-orm/libsql/migrator";

import { ensureLocalDatabaseDirectory } from "../src/db/local-file";

const databaseUrl = process.env.DATABASE_URL || "file:./data/site.db";
await ensureLocalDatabaseDirectory(databaseUrl);

const { client, db } = await import("../src/db/client");

try {
  await migrate(db, { migrationsFolder: "./drizzle" });
} finally {
  await client.close();
}
