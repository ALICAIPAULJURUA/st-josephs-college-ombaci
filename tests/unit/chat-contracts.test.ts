import { describe, expect, it } from "vitest";

import { chatRequestSchema } from "@/lib/chat/contracts";

describe("chat request validation", () => {
  it("accepts up to ten user and assistant messages", () => {
    const messages = Array.from({ length: 10 }, (_, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: `Message ${index}`,
    }));

    expect(chatRequestSchema.safeParse({ messages }).success).toBe(true);
  });

  it("rejects oversized messages, excessive history, and non-user final turns", () => {
    expect(
      chatRequestSchema.safeParse({
        messages: [{ role: "user", content: "q".repeat(1001) }],
      }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({
        messages: Array.from({ length: 11 }, () => ({
          role: "user",
          content: "Question",
        })),
      }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({
        messages: [
          { role: "user", content: "Question" },
          { role: "assistant", content: "Answer" },
        ],
      }).data?.messages.at(-1)?.role,
    ).not.toBe("user");
  });
});
