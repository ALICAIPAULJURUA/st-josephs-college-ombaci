import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

function databaseUrl() {
  return process.env.DATABASE_URL ?? "file:./data/site.db";
}

export const client = createClient({
  url: databaseUrl(),
  ...(process.env.DATABASE_AUTH_TOKEN
    ? { authToken: process.env.DATABASE_AUTH_TOKEN }
    : {}),
});

export const db = drizzle(client, { schema });
