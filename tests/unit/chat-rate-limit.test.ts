import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resolve } from "node:path";
import { consumeChatLimit, CHAT_IP_LIMIT } from "@/lib/chat/rate-limit";
import * as schema from "@/db/schema";

describe("assistant rate limits", () => {
  let client: ReturnType<typeof createClient>;
  let database: ReturnType<typeof drizzle<typeof schema>>;

  beforeEach(async () => {
    client = createClient({ url: "file::memory:" });
    database = drizzle(client, { schema });
    await migrate(database, {
      migrationsFolder: resolve(process.cwd(), "drizzle"),
    });
  });

  afterEach(async () => {
    await client.close();
  });

  it("limits each address to twenty messages per ten minutes", async () => {
    const now = Date.UTC(2026, 10, 1, 12, 0, 0);

    for (let count = 0; count < CHAT_IP_LIMIT; count += 1) {
      await expect(
        consumeChatLimit("192.0.2.10", now, database),
      ).resolves.toMatchObject({ allowed: true, reason: null });
    }

    await expect(
      consumeChatLimit("192.0.2.10", now, database),
    ).resolves.toMatchObject({ allowed: false, reason: "ip" });
    await expect(
      consumeChatLimit("192.0.2.10", now + 10 * 60 * 1000, database),
    ).resolves.toMatchObject({ allowed: true });
  });
});
