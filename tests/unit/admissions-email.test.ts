import { afterEach, describe, expect, it, vi } from "vitest";

import { sendEnquiryEmail } from "@/lib/admissions/email";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("admissions email", () => {
  it("sends an enquiry with escaped HTML and the expected recipient", async () => {
    vi.stubEnv("EMAIL_API_KEY", "test-resend-key");
    vi.stubEnv("EMAIL_FROM", "Ombaci <noreply@example.test>");
    vi.stubEnv("ADMISSIONS_EMAIL", "admissions@example.test");
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendEnquiryEmail({
      name: "<script>alert(1)</script>",
      email: "parent@example.test",
      phone: "",
      subject: "Admissions question",
      message: "Please <b>call</b> me.",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, options] = fetchMock.mock.calls[0]!;
    const messages = JSON.parse(String(options?.body)) as {
      to: string[];
      subject: string;
      html: string;
      text: string;
    }[];
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      to: ["admissions@example.test"],
      subject: "Website enquiry: Admissions question",
    });
    expect(messages[0]?.html).toContain(
      "&lt;script&gt;alert(1)&lt;/script&gt;",
    );
    expect(messages[0]?.html).not.toContain("<script>");
    expect(messages[0]?.text).toContain("<script>alert(1)</script>");
  });
});
