import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ApplicationDocumentName } from "@/content/schemas/application-fields";

const maxFileSize = 5 * 1024 * 1024;
const privateDirectory = path.resolve(
  /* turbopackIgnore: true */
  process.env.APPLICATION_PRIVATE_STORAGE_DIR ??
    path.join(process.cwd(), "data", "private-applications"),
);

export type PendingApplicationFile = {
  id: string;
  storageKey: string;
  fieldName: ApplicationDocumentName;
  originalName: string;
  mimeType: string;
  size: number;
  contents: Buffer;
};

export async function validateApplicationFile(
  fieldName: ApplicationDocumentName,
  file: File,
): Promise<PendingApplicationFile | null> {
  if (file.size === 0 && !file.name) return null;
  if (file.size > maxFileSize) {
    throw new Error("Each document must be no larger than 5 MB.");
  }

  const contents = Buffer.from(await file.arrayBuffer());
  const mimeType = detectedMimeType(contents);
  if (!mimeType) {
    throw new Error("Upload a valid PDF, JPG, or PNG document.");
  }

  return {
    id: randomUUID(),
    storageKey: `${randomUUID()}.${extensionFor(mimeType)}`,
    fieldName,
    originalName: safeOriginalName(file.name),
    mimeType,
    size: contents.byteLength,
    contents,
  };
}

export async function savePrivateApplicationFile(file: PendingApplicationFile) {
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.APPLICATION_PRIVATE_STORAGE_DIR
  ) {
    throw new Error(
      "Set APPLICATION_PRIVATE_STORAGE_DIR to a persistent private volume before accepting application documents in production.",
    );
  }

  await mkdir(privateDirectory, { recursive: true });
  const destination = privateFilePath(file.storageKey);
  await writeFile(destination, file.contents, { flag: "wx", mode: 0o600 });
  return destination;
}

export async function readPrivateApplicationFile(storageKey: string) {
  return readFile(/* turbopackIgnore: true */ privateFilePath(storageKey));
}

export async function removePrivateApplicationFile(storageKey: string) {
  await rm(privateFilePath(storageKey), { force: true });
}

function privateFilePath(storageKey: string) {
  if (!/^[0-9a-f-]{36}\.(pdf|jpg|png)$/.test(storageKey)) {
    throw new Error("The private document address is invalid.");
  }
  return path.join(
    /* turbopackIgnore: true */
    privateDirectory,
    storageKey,
  );
}

function safeOriginalName(name: string) {
  const basename = path.basename(name.replaceAll("\\", "/"));
  const safe = basename.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120);
  return safe || "application-document";
}

function extensionFor(
  mimeType: "application/pdf" | "image/jpeg" | "image/png",
) {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "image/jpeg") return "jpg";
  return "png";
}

function detectedMimeType(
  contents: Buffer,
): "application/pdf" | "image/jpeg" | "image/png" | null {
  if (contents.subarray(0, 5).toString("ascii") === "%PDF-") {
    return "application/pdf";
  }
  if (
    contents.length >= 8 &&
    contents
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (contents[0] === 0xff && contents[1] === 0xd8 && contents[2] === 0xff) {
    return "image/jpeg";
  }
  return null;
}
