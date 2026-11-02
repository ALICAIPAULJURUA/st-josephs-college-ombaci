"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { media } from "@/db/schema";
import { requireAdminRole } from "@/lib/admin/auth";

export type MediaActionState = {
  message?: string;
  error?: string;
};

const metadataSchema = z.object({
  id: z.uuid(),
  alt: z.string().trim().min(1).max(500),
  credit: z.string().trim().max(300),
  licence: z.string().trim().max(300),
  sourceUrl: z
    .string()
    .trim()
    .max(2048)
    .refine((value) => {
      if (!value) return true;
      if (!URL.canParse(value)) return false;
      return ["http:", "https:"].includes(new URL(value).protocol);
    }),
  isSample: z.boolean(),
  hasPeople: z.boolean(),
  consentRecorded: z.boolean(),
});

export async function updateMediaAction(
  _previousState: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  await requireAdminRole(["admin", "editor"]);
  const parsed = metadataSchema.safeParse({
    id: formData.get("id"),
    alt: formData.get("alt"),
    credit: formData.get("credit") ?? "",
    licence: formData.get("licence") ?? "",
    sourceUrl: formData.get("sourceUrl") ?? "",
    isSample: formData.get("isSample") === "on",
    hasPeople: formData.get("hasPeople") === "on",
    consentRecorded: formData.get("consentRecorded") === "on",
  });

  if (!parsed.success) {
    return { error: "Please check the photo details and try again." };
  }

  const sourceUrl = parsed.data.sourceUrl.trim();
  try {
    const updated = await db
      .update(media)
      .set({
        alt: parsed.data.alt,
        credit: parsed.data.credit || null,
        licence: parsed.data.licence || null,
        sourceUrl: sourceUrl || null,
        isSample: parsed.data.isSample,
        hasPeople: parsed.data.hasPeople,
        consentRecorded: parsed.data.consentRecorded,
      })
      .where(eq(media.id, parsed.data.id))
      .returning({ id: media.id });

    if (updated.length === 0) return { error: "We could not find that photo." };
    revalidatePath("/admin/media");
    return { message: "Photo details saved." };
  } catch (error) {
    console.error("Could not update photo details.", error);
    return { error: "We could not save those details. Please try again." };
  }
}
