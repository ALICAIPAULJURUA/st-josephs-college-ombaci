import { PGlite, types } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import { PgDatabase, type PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";

import * as schema from "./schema";

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

type DatabaseClient = {
  close: () => Promise<void>;
};

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;

  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production.");
  }

  return "pglite:./data/postgres";
}

function createLocalDatabase(url: string): {
  client: DatabaseClient;
  db: Database;
} {
  const dataDir =
    url === "pglite::memory:" ? undefined : url.slice("pglite:".length);
  const client = new PGlite(dataDir, {
    parsers: {
      [types.JSON]: (value) => value,
      [types.JSONB]: (value) => value,
    },
  });
  const database = drizzlePglite(client, { schema });

  return {
    client: { close: () => client.close() } satisfies DatabaseClient,
    db: database as Database,
  };
}

function createRemoteDatabase(url: string): {
  client: DatabaseClient;
  db: Database;
} {
  const client = new Pool({ connectionString: url });
  const database = drizzlePostgres(client, { schema });

  return {
    client: { close: () => client.end() } satisfies DatabaseClient,
    db: database as Database,
  };
}

export function createDatabase(
  url = getDatabaseUrl(),
) {
  if (url.startsWith("pglite:")) return createLocalDatabase(url);
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    return createRemoteDatabase(url);
  }
  throw new Error(
    "DATABASE_URL must use PostgreSQL or the local pglite: scheme.",
  );
}

type DatabaseRegistry = typeof globalThis & {
  __ombaciDatabaseInstances?: Map<string, ReturnType<typeof createDatabase>>;
};

const databaseUrl = getDatabaseUrl();
const registry = globalThis as DatabaseRegistry;
const instances: Map<string, ReturnType<typeof createDatabase>> =
  registry.__ombaciDatabaseInstances ?? new Map();
registry.__ombaciDatabaseInstances = instances;
const instance = instances.get(databaseUrl) ?? createDatabase(databaseUrl);
instances.set(databaseUrl, instance);

export const client: DatabaseClient = instance.client;
export const db: Database = instance.db;
