import { describe, expect, it } from "vitest";

import { parseEnv } from "@/lib/env";

describe("parseEnv", () => {
  it("defaults NODE_ENV to development", () => {
    expect(parseEnv({})).toEqual({
      NODE_ENV: "development",
      STORAGE_DRIVER: "local",
    });
  });

  it("rejects a malformed site URL", () => {
    expect(() =>
      parseEnv({ NODE_ENV: "test", NEXT_PUBLIC_SITE_URL: "not-a-url" }),
    ).toThrow();
  });

  it("treats blank development seed credentials as unset", () => {
    expect(
      parseEnv({
        NODE_ENV: "test",
        SEED_ADMIN_EMAIL: "",
        SEED_ADMIN_PASSWORD: "",
      }),
    ).toEqual({
      NODE_ENV: "test",
      STORAGE_DRIVER: "local",
      SEED_ADMIN_EMAIL: undefined,
      SEED_ADMIN_PASSWORD: undefined,
    });
  });

  it("accepts the owner's OPEN_ROUTER_API_KEY variable name", () => {
    expect(
      parseEnv({ NODE_ENV: "test", OPEN_ROUTER_API_KEY: "test-key" })
        .OPEN_ROUTER_API_KEY,
    ).toBe("test-key");
  });
});
