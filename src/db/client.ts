import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import { PgDatabase, type PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";

import * as schema from "./schema";

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

type DatabaseClient = {
  close: () => Promise<void>;
};

function createLocalDatabase(url: string) {
  const dataDir =
    url === "pglite::memory:" ? undefined : url.slice("pglite:".length);
  const client = new PGlite(dataDir);
  const database = drizzlePglite(client, { schema });

  return {
    client: { close: () => client.close() } satisfies DatabaseClient,
    db: database as Database,
  };
}

function createRemoteDatabase(url: string) {
  const client = new Pool({ connectionString: url });
  const database = drizzlePostgres(client, { schema });

  return {
    client: { close: () => client.end() } satisfies DatabaseClient,
    db: database as Database,
  };
}

export function createDatabase(
  url = process.env.DATABASE_URL || "pglite:./data/site.db",
) {
  if (url.startsWith("pglite:")) return createLocalDatabase(url);
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    return createRemoteDatabase(url);
  }
  throw new Error(
    "DATABASE_URL must use PostgreSQL or the local pglite: scheme.",
  );
}

export const { client, db } = createDatabase();
