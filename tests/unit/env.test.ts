import { describe, expect, it } from "vitest";

import { parseEnv } from "@/lib/env";

describe("parseEnv", () => {
  it("defaults NODE_ENV to development", () => {
    expect(parseEnv({})).toEqual({ NODE_ENV: "development" });
  });

  it("rejects a malformed site URL", () => {
    expect(() =>
      parseEnv({ NODE_ENV: "test", NEXT_PUBLIC_SITE_URL: "not-a-url" }),
    ).toThrow();
  });
});
