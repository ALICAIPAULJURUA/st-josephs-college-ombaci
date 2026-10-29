import { describe, expect, it } from "vitest";

import { siteSettings } from "@/content/site";
import { buildWhatsAppHref } from "@/lib/whatsapp";

describe("buildWhatsAppHref", () => {
  it("returns null without a configured number", () => {
    expect(buildWhatsAppHref(undefined)).toBeNull();
    expect(buildWhatsAppHref("")).toBeNull();
    expect(buildWhatsAppHref("not a number")).toBeNull();
  });

  it("strips formatting from the number", () => {
    expect(buildWhatsAppHref("+1 (555) 010-9999", "Hello")).toBe(
      "https://wa.me/15550109999?text=Hello",
    );
  });

  it("uses the school message and encodes it", () => {
    expect(buildWhatsAppHref("256 000 000000")).toBe(
      `https://wa.me/256000000000?text=${encodeURIComponent(siteSettings.whatsappMessage)}`,
    );
  });
});
