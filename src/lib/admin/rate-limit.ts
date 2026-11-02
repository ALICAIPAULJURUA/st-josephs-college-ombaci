import { createHash } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { sql } from "drizzle-orm";

import { db } from "@/db/client";
import { loginAttempts } from "@/db/schema";

export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export function loginAttemptKey(email: string, address: string) {
  return createHash("sha256")
    .update(`${email.trim().toLowerCase()}\u0000${address}`)
    .digest("hex");
}

export async function isLoginLocked(key: string, now = Date.now()) {
  const [attempt] = await db
    .select({ lockedUntil: loginAttempts.lockedUntil })
    .from(loginAttempts)
    .where(and(eq(loginAttempts.key, key), gt(loginAttempts.lockedUntil, now)))
    .limit(1);

  return Boolean(attempt);
}

export async function recordLoginFailure(key: string, now = Date.now()) {
  await db
    .insert(loginAttempts)
    .values({
      key,
      failures: 1,
      windowStartedAt: now,
      lockedUntil: null,
    })
    .onConflictDoUpdate({
      target: loginAttempts.key,
      set: {
        failures: sql`CASE
          WHEN ${loginAttempts.windowStartedAt} <= ${now - LOGIN_WINDOW_MS}
          THEN 1 ELSE ${loginAttempts.failures} + 1 END`,
        windowStartedAt: sql`CASE
          WHEN ${loginAttempts.windowStartedAt} <= ${now - LOGIN_WINDOW_MS}
          THEN ${now} ELSE ${loginAttempts.windowStartedAt} END`,
        lockedUntil: sql`CASE
          WHEN ${loginAttempts.windowStartedAt} <= ${now - LOGIN_WINDOW_MS}
          THEN NULL
          WHEN ${loginAttempts.failures} + 1 >= ${LOGIN_MAX_FAILURES}
          THEN ${now + LOGIN_WINDOW_MS}
          ELSE ${loginAttempts.lockedUntil} END`,
      },
    });
}

export async function clearLoginFailures(key: string) {
  await db.delete(loginAttempts).where(eq(loginAttempts.key, key));
}
