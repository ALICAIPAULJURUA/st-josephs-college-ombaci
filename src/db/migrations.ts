import { resolve } from "node:path";

import * as schema from "./schema";

const migrationsFolder = resolve(process.cwd(), "drizzle/postgres");

export async function migrateDatabase(url: string) {
  if (url.startsWith("pglite:")) {
    const [{ PGlite }, { drizzle }, { migrate }] = await Promise.all([
      import("@electric-sql/pglite"),
      import("drizzle-orm/pglite"),
      import("drizzle-orm/pglite/migrator"),
    ]);
    const dataDir =
      url === "pglite::memory:" ? undefined : url.slice("pglite:".length);
    const client = new PGlite(dataDir);

    try {
      await migrate(drizzle(client, { schema }), { migrationsFolder });
    } finally {
      await client.close();
    }

    return;
  }

  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
    throw new Error(
      "DATABASE_URL must use PostgreSQL or the local pglite: scheme.",
    );
  }

  const [{ Pool }, { drizzle }, { migrate }] = await Promise.all([
    import("pg"),
    import("drizzle-orm/node-postgres"),
    import("drizzle-orm/node-postgres/migrator"),
  ]);
  const client = new Pool({ connectionString: url });

  try {
    await migrate(drizzle(client, { schema }), { migrationsFolder });
  } finally {
    await client.end();
  }
}
