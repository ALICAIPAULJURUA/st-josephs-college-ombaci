import { createHmac, timingSafeEqual } from "node:crypto";

export const CHAT_VERIFICATION_COOKIE = "ombaci_chat_verified";
export const CHAT_VERIFICATION_MAX_AGE_SECONDS = 30 * 60;

function signature(expiresAt: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required for chat verification.");
  return createHmac("sha256", secret).update(expiresAt).digest("base64url");
}

export function createChatVerificationCookie(now = Date.now()) {
  const expiresAt = String(
    Math.floor(now / 1000) + CHAT_VERIFICATION_MAX_AGE_SECONDS,
  );
  return `${expiresAt}.${signature(expiresAt)}`;
}

export function hasValidChatVerificationCookie(
  value: string | undefined,
  now = Date.now(),
) {
  if (!value) return false;
  const [expiresAt, providedSignature, ...extra] = value.split(".");
  if (
    !expiresAt ||
    !providedSignature ||
    extra.length > 0 ||
    !/^\d+$/.test(expiresAt) ||
    Number(expiresAt) <= Math.floor(now / 1000)
  ) {
    return false;
  }

  const expected = Buffer.from(signature(expiresAt));
  const provided = Buffer.from(providedSignature);
  return (
    expected.length === provided.length &&
    timingSafeEqual(expected, provided)
  );
}
