import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/client";
import { applicationFiles } from "@/db/schema";
import { isValidApplicationFileLink } from "@/lib/admissions/file-links";
import { readPrivateApplicationFile } from "@/lib/admissions/private-files";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const expires = request.nextUrl.searchParams.get("expires") ?? "";
  const signature = request.nextUrl.searchParams.get("signature") ?? "";
  if (!isValidApplicationFileLink(id, expires, signature)) {
    return new NextResponse("This private document link has expired.", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const user = await getAuthenticatedAdmin();
  if (!user || user.role === "editor") {
    return new NextResponse("Not found.", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const [file] = await db
    .select()
    .from(applicationFiles)
    .where(eq(applicationFiles.id, id))
    .limit(1);
  if (!file) {
    return new NextResponse("Not found.", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const contents = await readPrivateApplicationFile(file.storageKey);
  const safeName = file.originalName.replace(/["\r\n]/g, "_");
  return new NextResponse(new Uint8Array(contents), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Content-Length": String(contents.byteLength),
      "Content-Security-Policy": "sandbox",
      "Content-Type": file.mimeType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
