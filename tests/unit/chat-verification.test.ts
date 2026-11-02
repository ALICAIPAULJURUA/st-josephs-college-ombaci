import { afterEach, describe, expect, it } from "vitest";

import {
  createChatVerificationCookie,
  hasValidChatVerificationCookie,
} from "@/lib/chat/verification";

const originalSecret = process.env.SESSION_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.SESSION_SECRET;
  } else {
    process.env.SESSION_SECRET = originalSecret;
  }
});

describe("chat verification cookie", () => {
  it("signs a short-lived first-message verification", () => {
    process.env.SESSION_SECRET = "unit-test-session-secret-with-32-characters";
    const now = Date.UTC(2026, 10, 1, 0, 0, 0);
    const cookie = createChatVerificationCookie(now);

    expect(hasValidChatVerificationCookie(cookie, now)).toBe(true);
    expect(hasValidChatVerificationCookie(cookie, now + 31 * 60 * 1000)).toBe(
      false,
    );
    expect(
      hasValidChatVerificationCookie(`${cookie}tampered`, now),
    ).toBe(false);
  });
});
