import { createHash } from "node:crypto";
import { lt, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { chatRateLimits } from "@/db/schema";

type ChatDatabase = typeof db;

export const CHAT_IP_WINDOW_MS = 10 * 60 * 1000;
export const CHAT_IP_LIMIT = 20;
export const CHAT_DAILY_LIMIT = 1000;

function rateLimitKey(value: string) {
  return createHash("sha256").update(`ombaci-chat\u0000${value}`).digest("hex");
}

async function consumeBucket(
  database: ChatDatabase,
  key: string,
  windowMs: number,
  limit: number,
  now: number,
) {
  const [result] = await database
    .insert(chatRateLimits)
    .values({ key, count: 1, windowStartedAt: now })
    .onConflictDoUpdate({
      target: chatRateLimits.key,
      set: {
        count: sql`CASE
          WHEN ${chatRateLimits.windowStartedAt} <= ${now - windowMs}
          THEN 1 ELSE ${chatRateLimits.count} + 1 END`,
        windowStartedAt: sql`CASE
          WHEN ${chatRateLimits.windowStartedAt} <= ${now - windowMs}
          THEN ${now} ELSE ${chatRateLimits.windowStartedAt} END`,
      },
    })
    .returning({
      count: chatRateLimits.count,
      windowStartedAt: chatRateLimits.windowStartedAt,
    });

  return {
    allowed: result.count <= limit,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((result.windowStartedAt + windowMs - now) / 1000),
    ),
  };
}

export async function consumeChatLimit(
  address: string,
  now = Date.now(),
  database: ChatDatabase = db,
) {
  await database.delete(chatRateLimits).where(
    lt(chatRateLimits.windowStartedAt, now - 2 * 24 * 60 * 60 * 1000),
  );

  const ipKey = rateLimitKey(`ip:${address}`);
  const ipLimit = await consumeBucket(
    database,
    ipKey,
    CHAT_IP_WINDOW_MS,
    CHAT_IP_LIMIT,
    now,
  );
  if (!ipLimit.allowed) return { ...ipLimit, reason: "ip" as const };

  const day = new Date(now).toISOString().slice(0, 10);
  const dailyLimit = await consumeBucket(
    database,
    rateLimitKey(`daily:${day}`),
    24 * 60 * 60 * 1000,
    CHAT_DAILY_LIMIT,
    now,
  );

  return dailyLimit.allowed
    ? { ...dailyLimit, reason: null }
    : { ...dailyLimit, reason: "daily" as const };
}
