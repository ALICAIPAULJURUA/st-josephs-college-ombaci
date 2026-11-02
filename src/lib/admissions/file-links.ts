import { createHmac, timingSafeEqual } from "node:crypto";

const linkLifetimeMs = 5 * 60 * 1000;

function signingSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("Private document links require SESSION_SECRET.");
  }
  return secret;
}

function sign(fileId: string, expires: string) {
  return createHmac("sha256", signingSecret())
    .update(`${fileId}:${expires}`)
    .digest("hex");
}

export function createApplicationFileUrl(fileId: string, now = Date.now()) {
  const expires = String(now + linkLifetimeMs);
  const signature = sign(fileId, expires);
  return `/api/admin/application-files/${encodeURIComponent(fileId)}?expires=${expires}&signature=${signature}`;
}

export function isValidApplicationFileLink(
  fileId: string,
  expires: string,
  signature: string,
  now = Date.now(),
) {
  if (!/^\d{13}$/.test(expires) || !/^[0-9a-f]{64}$/.test(signature)) {
    return false;
  }
  const expiry = Number(expires);
  if (expiry < now || expiry > now + linkLifetimeMs) return false;

  const expected = Buffer.from(sign(fileId, expires), "hex");
  const supplied = Buffer.from(signature, "hex");
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
