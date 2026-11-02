import { migrate } from "drizzle-orm/libsql/migrator";

import { ensureLocalDatabaseDirectory } from "../src/db/local-file";
import {
  parseSeedAdminConfig,
  seedContent,
  seedDevelopmentAdmin,
} from "../src/db/seed";

const databaseUrl = process.env.DATABASE_URL || "file:./data/site.db";
const adminConfig = {
  email: process.env.SEED_ADMIN_EMAIL,
  password: process.env.SEED_ADMIN_PASSWORD,
  nodeEnv: process.env.NODE_ENV,
};
parseSeedAdminConfig(adminConfig);

await ensureLocalDatabaseDirectory(databaseUrl);
const { client, db } = await import("../src/db/client");

try {
  await migrate(db, { migrationsFolder: "./drizzle" });
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
