import { z } from "zod";

export const chatRequestSchema = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(1000),
        }),
      )
      .min(1)
      .max(10),
    turnstileToken: z.string().min(1).max(2048).optional(),
  })
  .strict();

export type ChatRequest = z.infer<typeof chatRequestSchema>;
