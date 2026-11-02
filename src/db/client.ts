import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

export function createDatabase(
  url = process.env.DATABASE_URL || "file:./data/site.db",
  authToken = process.env.DATABASE_AUTH_TOKEN,
) {
  const client = createClient({
    url,
    ...(!url.startsWith("file:") && authToken ? { authToken } : {}),
  });

  return {
    client,
    db: drizzle(client, { schema }),
  };
}

export const { client, db } = createDatabase();
