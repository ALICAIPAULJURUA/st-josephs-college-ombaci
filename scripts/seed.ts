import { ensureLocalDatabaseDirectory } from "../src/db/local-file";
import { migrateDatabase } from "../src/db/migrations";
import {
  parseSeedAdminConfig,
  seedContent,
  seedDevelopmentAdmin,
} from "../src/db/seed";

const databaseUrl = process.env.DATABASE_URL || "pglite:./data/postgres";
const migrationUrl = databaseUrl.startsWith("pglite:")
  ? databaseUrl
  : process.env.DATABASE_URL_UNPOOLED || databaseUrl;
const adminConfig = {
  email: process.env.SEED_ADMIN_EMAIL,
  password: process.env.SEED_ADMIN_PASSWORD,
  nodeEnv: process.env.NODE_ENV,
};
parseSeedAdminConfig(adminConfig);

await ensureLocalDatabaseDirectory(databaseUrl);
await ensureLocalDatabaseDirectory(migrationUrl);
const { client, db } = await import("../src/db/client");

try {
  await migrateDatabase(migrationUrl);
  await seedContent(db);
  const adminStatus = await seedDevelopmentAdmin(db, adminConfig);

  console.log("Database migrations applied.");
  console.log(
    "Settings and Home defaults seeded without replacing existing content.",
  );
  console.log(
    adminStatus === "created"
      ? "Development admin created."
      : adminStatus === "already-exists"
        ? "Development admin already exists; it was not changed."
        : "No development admin credentials were provided.",
  );
} finally {
  await client.close();
}
