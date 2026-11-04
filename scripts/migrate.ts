import { ensureLocalDatabaseDirectory } from "../src/db/local-file";
import { migrateDatabase } from "../src/db/migrations";

const databaseUrl = process.env.DATABASE_URL || "pglite:./data/site.db";
const migrationUrl = databaseUrl.startsWith("pglite:")
  ? databaseUrl
  : process.env.DATABASE_URL_UNPOOLED || databaseUrl;
await ensureLocalDatabaseDirectory(databaseUrl);
await ensureLocalDatabaseDirectory(migrationUrl);
await migrateDatabase(migrationUrl);
