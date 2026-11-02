import { afterEach, describe, expect, it } from "vitest";

import {
  isChatConfigured,
  isChatProviderConfigured,
} from "@/lib/chat/config";

const configKeys = [
  "OPENROUTER_API_KEY",
  "OPEN_ROUTER_API_KEY",
  "SESSION_SECRET",
  "TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
] as const;

const originalConfig = Object.fromEntries(
  configKeys.map((key) => [key, process.env[key]]),
);

afterEach(() => {
  for (const key of configKeys) {
    const value = originalConfig[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("assistant configuration", () => {
  it("allows the launcher but not chat when Turnstile is missing", () => {
    process.env.OPENROUTER_API_KEY = "test-provider-key";
    process.env.SESSION_SECRET = "test-session-secret";
    delete process.env.OPEN_ROUTER_API_KEY;
    delete process.env.TURNSTILE_SITE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;

    expect(isChatProviderConfigured()).toBe(true);
    expect(isChatConfigured()).toBe(false);
  });

  it("requires both Turnstile keys before enabling chat", () => {
    process.env.OPEN_ROUTER_API_KEY = "test-provider-key";
    process.env.SESSION_SECRET = "test-session-secret";
    process.env.TURNSTILE_SITE_KEY = "test-site-key";
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;

    expect(isChatProviderConfigured()).toBe(true);
    expect(isChatConfigured()).toBe(false);

    process.env.TURNSTILE_SECRET_KEY = "test-secret-key";

    expect(isChatConfigured()).toBe(true);
  });
});
