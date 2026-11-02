import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { lt, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { submissionRateLimits } from "@/db/schema";

const APPLICATION_WINDOW_MS = 60 * 60 * 1000;
const CONTACT_WINDOW_MS = 60 * 60 * 1000;

export function getClientAddress(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();
  const address = forwarded && isIP(forwarded) ? forwarded : realIp;

  if (!address || !isIP(address)) {
    throw new Error("A trusted client address is required for form submission.");
  }

  return address;
}

export async function consumeSubmissionLimit(
  kind: "application" | "contact",
  address: string,
  now = Date.now(),
) {
  const windowMs =
    kind === "application" ? APPLICATION_WINDOW_MS : CONTACT_WINDOW_MS;
  const maxSubmissions = 5;
  const key = createHash("sha256")
    .update(`${kind}\u0000${address}`)
    .digest("hex");

  await db
    .delete(submissionRateLimits)
    .where(
      lt(submissionRateLimits.windowStartedAt, now - APPLICATION_WINDOW_MS),
    );

  const [result] = await db
    .insert(submissionRateLimits)
    .values({ key, count: 1, windowStartedAt: now })
    .onConflictDoUpdate({
      target: submissionRateLimits.key,
      set: {
        count: sql`CASE
          WHEN ${submissionRateLimits.windowStartedAt} <= ${now - windowMs}
          THEN 1 ELSE ${submissionRateLimits.count} + 1 END`,
        windowStartedAt: sql`CASE
          WHEN ${submissionRateLimits.windowStartedAt} <= ${now - windowMs}
          THEN ${now} ELSE ${submissionRateLimits.windowStartedAt} END`,
      },
    })
    .returning({
      count: submissionRateLimits.count,
      windowStartedAt: submissionRateLimits.windowStartedAt,
    });

  return {
    allowed: result.count <= maxSubmissions,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((result.windowStartedAt + windowMs - now) / 1000),
    ),
  };
}
