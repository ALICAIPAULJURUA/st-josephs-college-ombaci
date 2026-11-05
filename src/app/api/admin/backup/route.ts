import { NextResponse } from "next/server";

import { getSettingsRows } from "@/db/queries";
import { db } from "@/db/client";
import { items, media, pages, redirects } from "@/db/schema";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in again to continue." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "You do not have permission to download a backup." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const [settingsRows, pageRows, itemRows, mediaRows, redirectRows] =
    await Promise.all([
      getSettingsRows(),
      db.select().from(pages),
      db.select().from(items),
      db.select().from(media),
      db.select().from(redirects),
    ]);

  const generatedAt = new Date();
  const backup = {
    formatVersion: 1,
    generatedAt: generatedAt.toISOString(),
    contents: {
      settings: settingsRows,
      pages: pageRows,
      items: itemRows,
      media: mediaRows,
      redirects: redirectRows,
    },
    excluded: [
      "User accounts and password hashes",
      "Applications, enquiries, and private application files",
      "Assistant questions and rate-limit records",
    ],
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `attachment; filename="ombaci-content-backup-${generatedAt.toISOString().slice(0, 10)}.json"`,
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
