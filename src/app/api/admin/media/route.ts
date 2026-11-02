import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/db/client";
import { media } from "@/db/schema";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { isSameOrigin } from "@/lib/admin/same-origin";
import { getMediaStorage } from "@/lib/admin/storage";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 32 * 1024;

function formText(formData: FormData, key: string, maximumLength: number) {
  const value = formData.get(key);
  if (value === null) return "";
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length <= maximumLength ? trimmed : null;
}

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "true";
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to upload photos." }, { status: 401 });
  }
  if (user.role === "admissions") {
    return NextResponse.json({ error: "You do not have permission to upload photos." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_SIZE) {
    return NextResponse.json({ error: "Choose a photo smaller than 10 MB." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("Could not read uploaded media form data.", error);
    return NextResponse.json({ error: "We could not read that upload." }, { status: 400 });
  }

  const file = formData.get("file");
  const alt = formText(formData, "alt", 500);
  const credit = formText(formData, "credit", 300);
  const licence = formText(formData, "licence", 300);
  const sourceUrl = formText(formData, "sourceUrl", 2048);
  if (
    !(file instanceof File) ||
    file.size < 1 ||
    file.size > MAX_FILE_SIZE ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    !alt ||
    credit === null ||
    licence === null ||
    sourceUrl === null
  ) {
    return NextResponse.json({
      error: "Choose a JPG, PNG or WebP under 10 MB, add alt text, and check the other details.",
    }, { status: 400 });
  }

  if (
    sourceUrl &&
    (!URL.canParse(sourceUrl) ||
      !["http:", "https:"].includes(new URL(sourceUrl).protocol))
  ) {
    return NextResponse.json({ error: "Enter a valid source URL." }, { status: 400 });
  }

  const imageBytes = Buffer.from(await file.arrayBuffer());
  let imageInfo: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  let processed: Awaited<ReturnType<ReturnType<typeof sharp>["toBuffer"]>>;
  try {
    imageInfo = await sharp(imageBytes, {
      limitInputPixels: 40_000_000,
      failOn: "error",
    }).metadata();
    processed = await sharp(imageBytes, {
      limitInputPixels: 40_000_000,
      failOn: "error",
    })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true });
  } catch (error) {
    console.error("Could not decode or resize uploaded media.", error);
    return NextResponse.json({ error: "That photo could not be processed. Check the file and try again." }, { status: 400 });
  }
  const allowedFormats = {
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/webp": "webp",
  } as const;
  if (imageInfo.format !== allowedFormats[file.type as keyof typeof allowedFormats]) {
    return NextResponse.json({ error: "The photo contents do not match its file type." }, { status: 400 });
  }

  const id = randomUUID();
  const isSample = checkbox(formData, "isSample");
  const hasPeople = checkbox(formData, "hasPeople");
  const consentRecorded = checkbox(formData, "consentRecorded");
  let storage: ReturnType<typeof getMediaStorage>;
  let stored: { key: string; url: string };
  try {
    storage = getMediaStorage();
    stored = await storage.save(id, processed.data);
  } catch (error) {
    console.error("Could not store uploaded media.", error);
    return NextResponse.json({ error: "Photo storage is not available. Please try again later." }, { status: 503 });
  }

  try {
    await db.insert(media).values({
      id,
      file: stored.key,
      alt,
      width: processed.info.width,
      height: processed.info.height,
      credit: credit || null,
      licence: licence || null,
      sourceUrl: sourceUrl || null,
      isSample,
      hasPeople,
      consentRecorded,
      createdAt: Date.now(),
    });
  } catch (error) {
    try {
      await storage.remove(stored.key);
    } catch (cleanupError) {
      console.error("Could not remove a media upload after its database insert failed.", cleanupError);
    }
    console.error("Could not save uploaded media details.", error);
    return NextResponse.json({ error: "We could not save that photo. Please try again." }, { status: 500 });
  }

  return NextResponse.json({
    id,
    url: stored.url,
    alt,
    width: processed.info.width,
    height: processed.info.height,
  }, { status: 201 });
}
