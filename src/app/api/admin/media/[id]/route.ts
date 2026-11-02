import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import { media } from "@/db/schema";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { isSameOrigin } from "@/lib/admin/same-origin";
import { getMediaStorage } from "@/lib/admin/storage";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to remove photos." }, { status: 401 });
  }
  if (user.role === "admissions") {
    return NextResponse.json({ error: "You do not have permission to remove photos." }, { status: 403 });
  }

  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: "That photo could not be found." }, { status: 404 });
  }

  const [item] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (!item) {
    return NextResponse.json({ error: "That photo could not be found." }, { status: 404 });
  }

  try {
    await getMediaStorage().remove(item.file);
    await db.delete(media).where(eq(media.id, id));
  } catch (error) {
    console.error("Could not delete media.", error);
    return NextResponse.json({ error: "We could not remove that photo. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
