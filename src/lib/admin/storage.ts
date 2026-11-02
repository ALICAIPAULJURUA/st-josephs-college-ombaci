import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

type StoredMedia = {
  key: string;
  url: string;
};

type MediaStorage = {
  save(id: string, image: Buffer): Promise<StoredMedia>;
  remove(key: string): Promise<void>;
  url(key: string): string;
};

const uploadDirectory = path.join(process.cwd(), "public", "uploads");

function localStorage(): MediaStorage {
  return {
    async save(id, image) {
      await mkdir(uploadDirectory, { recursive: true });
      const key = `/uploads/${id}.webp`;
      await writeFile(path.join(uploadDirectory, `${id}.webp`), image);
      return { key, url: key };
    },
    async remove(key) {
      const filename = path.posix.basename(key);
      if (key !== `/uploads/${filename}` || !/^[0-9a-f-]+\.webp$/.test(filename)) {
        throw new Error("The stored photo address is invalid.");
      }
      await rm(path.join(uploadDirectory, filename), { force: true });
    },
    url(key) {
      const filename = path.posix.basename(key);
      if (key !== `/uploads/${filename}` || !/^[0-9a-f-]+\.webp$/.test(filename)) {
        throw new Error("The stored photo address is invalid.");
      }
      return key;
    },
  };
}

function cloudinaryConfiguration() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary storage needs CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }
  return { cloudName, apiKey, apiSecret };
}

function cloudinarySignature(
  parameters: Record<string, string>,
  apiSecret: string,
) {
  const signatureBase = Object.entries(parameters)
    .filter(([, value]) => value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1")
    .update(`${signatureBase}${apiSecret}`)
    .digest("hex");
}

function cloudinaryStorage(): MediaStorage {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfiguration();
  const baseUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image`;

  return {
    async save(id, image) {
      const publicId = `ombaci/${id}`;
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const parameters = {
        folder: "ombaci",
        public_id: id,
        timestamp,
      };
      const formData = new FormData();
      const uploadBytes = new Uint8Array(new ArrayBuffer(image.byteLength));
      uploadBytes.set(image);
      formData.set(
        "file",
        new Blob([uploadBytes], { type: "image/webp" }),
        `${id}.webp`,
      );
      formData.set("api_key", apiKey);
      formData.set("timestamp", timestamp);
      formData.set("folder", parameters.folder);
      formData.set("public_id", parameters.public_id);
      formData.set(
        "signature",
        cloudinarySignature(parameters, apiSecret),
      );

      const response = await fetch(`${baseUrl}/upload`, {
        method: "POST",
        body: formData,
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Cloudinary upload failed with status ${response.status}.`);
      }

      const payload: unknown = await response.json();
      if (
        !payload ||
        typeof payload !== "object" ||
        !("secure_url" in payload) ||
        typeof payload.secure_url !== "string"
      ) {
        throw new Error("Cloudinary returned an incomplete upload response.");
      }

      return { key: `cloudinary:${publicId}`, url: payload.secure_url };
    },
    async remove(key) {
      const publicId = cloudinaryPublicId(key);
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const parameters = { public_id: publicId, timestamp };
      const formData = new FormData();
      formData.set("api_key", apiKey);
      formData.set("public_id", publicId);
      formData.set("timestamp", timestamp);
      formData.set(
        "signature",
        cloudinarySignature(parameters, apiSecret),
      );
      const response = await fetch(`${baseUrl}/destroy`, {
        method: "POST",
        body: formData,
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Cloudinary delete failed with status ${response.status}.`);
      }

      const payload: unknown = await response.json();
      if (
        !payload ||
        typeof payload !== "object" ||
        !("result" in payload) ||
        (payload.result !== "ok" && payload.result !== "not found")
      ) {
        throw new Error("Cloudinary did not confirm the photo deletion.");
      }
    },
    url(key) {
      const publicId = cloudinaryPublicId(key);
      return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}.webp`;
    },
  };
}

function cloudinaryPublicId(key: string) {
  const prefix = "cloudinary:";
  if (!key.startsWith(prefix)) {
    throw new Error("The stored Cloudinary photo address is invalid.");
  }
  const publicId = key.slice(prefix.length);
  if (!/^ombaci\/[0-9a-f-]+$/.test(publicId)) {
    throw new Error("The stored Cloudinary photo address is invalid.");
  }
  return publicId;
}

export function getMediaStorage(): MediaStorage {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver === "local") return localStorage();
  if (driver === "cloudinary") return cloudinaryStorage();
  throw new Error(`The photo storage driver "${driver}" is not supported.`);
}

export function getMediaUrl(key: string) {
  return getMediaStorage().url(key);
}
