import { describe, expect, it } from "vitest";

import { contentSecurityPolicy } from "@/lib/headers";

describe("contentSecurityPolicy", () => {
  it("allows same-origin scripts only on admin routes", () => {
    const publicPolicy = contentSecurityPolicy("public-nonce", false, false);
    const adminPolicy = contentSecurityPolicy("admin-nonce", false, true);

    expect(publicPolicy).toContain("'nonce-public-nonce'");
    expect(publicPolicy).not.toContain(
      "script-src 'nonce-public-nonce' 'strict-dynamic' 'self'",
    );
    expect(adminPolicy).toContain(
      "script-src 'nonce-admin-nonce' 'strict-dynamic' 'self'",
    );
  });

  it("allows Next.js development tooling styles only in development", () => {
    const developmentPolicy = contentSecurityPolicy("dev-nonce", true, false);
    const productionPolicy = contentSecurityPolicy("prod-nonce", false, false);

    expect(developmentPolicy).toContain(
      "style-src-elem 'self' 'nonce-dev-nonce' 'unsafe-inline'",
    );
    expect(productionPolicy).toContain(
      "style-src-elem 'self' 'nonce-prod-nonce'",
    );
    expect(
      productionPolicy
        .split(";")
        .find((directive) => directive.trim().startsWith("style-src-elem")),
    ).not.toContain("'unsafe-inline'");
  });
});
