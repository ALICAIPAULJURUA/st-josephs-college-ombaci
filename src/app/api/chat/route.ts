import { createHash, randomUUID } from "node:crypto";
import { and, eq, lt } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/db/client";
import { chatLog, settings } from "@/db/schema";
import { isSameOrigin } from "@/lib/admin/same-origin";
import { getClientAddress } from "@/lib/admissions/rate-limit";
import { TurnstileError, verifyTurnstile } from "@/lib/admissions/turnstile";
import {
  DEFAULT_OPENROUTER_MODEL,
  getOpenRouterApiKey,
  OPENROUTER_ENDPOINT,
} from "@/lib/chat/config";
import { chatRequestSchema } from "@/lib/chat/contracts";
import { buildAssistantKnowledge } from "@/lib/chat/knowledge";
import { consumeChatLimit } from "@/lib/chat/rate-limit";
import { assistantSystemPrompt } from "@/lib/chat/system-prompt";
import {
  CHAT_VERIFICATION_COOKIE,
  createChatVerificationCookie,
  hasValidChatVerificationCookie,
} from "@/lib/chat/verification";

const MAX_REQUEST_BYTES = 16 * 1024;
const CHAT_LOG_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

function jsonError(message: string, status: number, retryAfter?: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
      },
    },
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function providerText(value: unknown) {
  if (!isRecord(value) || !Array.isArray(value.choices)) return "";
  const choice = value.choices[0];
  if (!isRecord(choice) || !isRecord(choice.delta)) return "";
  const content = choice.delta.content;
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  const textParts: string[] = [];
  for (const part of content) {
    if (
      isRecord(part) &&
      part.type === "text" &&
      typeof part.text === "string"
    ) {
      textParts.push(part.text);
    }
  }
  return textParts.join("");
}

function isUnanswered(answer: string) {
  return /don't have that information|do not have that information|not in the (?:school's )?published|cannot confirm|can't confirm|not available in the (?:published|school)/i.test(
    answer,
  );
}

async function saveQuestion(question: string, answer: string) {
  const now = Date.now();
  await db.delete(chatLog).where(lt(chatLog.createdAt, now - CHAT_LOG_RETENTION_MS));
  await db.insert(chatLog).values({
    id: randomUUID(),
    question,
    answered: Boolean(answer.trim()) && !isUnanswered(answer),
    createdAt: now,
  });
}

function streamAssistantResponse(
  body: ReadableStream<Uint8Array>,
  question: string,
) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = body.getReader();
  let buffer = "";
  let answer = "";

  function pushLine(line: string, controller: ReadableStreamDefaultController) {
    if (!line.startsWith("data:")) return false;
    const data = line.slice(5).trim();
    if (data === "[DONE]") return true;

    let event: unknown;
    try {
      event = JSON.parse(data);
    } catch (error) {
      console.error("The OpenRouter stream returned invalid event data.", error);
      throw new Error("The assistant returned an invalid response.");
    }

    if (isRecord(event) && "error" in event) {
      throw new Error("The assistant stream returned an error.");
    }

    const text = providerText(event);
    if (text) {
      answer += text;
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(text)}\n\n`),
      );
    }
    return false;
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        let finished = false;
        while (!finished) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (pushLine(line, controller)) {
              finished = true;
              break;
            }
          }
        }

        if (buffer.trim()) pushLine(buffer, controller);
        try {
          await saveQuestion(question, answer);
        } catch (error) {
          console.error("The anonymous assistant question could not be logged.", error);
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("The assistant response stream could not be completed.", error);
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return jsonError("This request could not be verified.", 403);
  }

  const contentLength = request.headers.get("content-length");
  if (
    contentLength !== null &&
    (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_REQUEST_BYTES)
  ) {
    return jsonError("Your message is too long. Please shorten it and try again.", 413);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return jsonError("Please check your message and try again.", 400);
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return jsonError("Your message is too long. Please shorten it and try again.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonError("Please check your message and try again.", 400);
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success || parsed.data.messages.at(-1)?.role !== "user") {
    return jsonError(
      "Send a question of up to 1,000 characters and try again.",
      400,
    );
  }

  const [assistantSetting] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(and(eq(settings.key, "assistantEnabled"), eq(settings.value, true)))
    .limit(1);
  if (!assistantSetting) return jsonError("The assistant is unavailable.", 404);

  const apiKey = getOpenRouterApiKey();
  if (!apiKey || !process.env.SESSION_SECRET) {
    return jsonError("The assistant is temporarily unavailable.", 503);
  }

  let address: string;
  try {
    address = getClientAddress(request.headers);
  } catch {
    return jsonError("The assistant is temporarily unavailable.", 503);
  }

  const hasVerification = hasValidChatVerificationCookie(
    request.cookies.get(CHAT_VERIFICATION_COOKIE)?.value,
  );
  if (!hasVerification) {
    if (!parsed.data.turnstileToken) {
      return jsonError("Complete the security check before asking a question.", 400);
    }
    try {
      await verifyTurnstile(parsed.data.turnstileToken, address);
    } catch (error) {
      if (error instanceof TurnstileError) {
        return jsonError(error.message, error.status);
      }
      throw error;
    }
  }

  const rate = await consumeChatLimit(address);
  if (!rate.allowed) {
    return jsonError(
      rate.reason === "daily"
        ? "The assistant has reached its daily message limit. Please contact the school."
        : "Please wait a little before asking another question.",
      429,
      rate.retryAfterSeconds,
    );
  }

  const knowledge = await buildAssistantKnowledge();
  const system = `${assistantSystemPrompt}\n\n${knowledge}`;
  const cacheKey = createHash("sha256").update(system).digest("hex");
  const messages = [
    { role: "system", content: system },
    ...parsed.data.messages.map(({ role, content }) => ({ role, content })),
  ];

  let providerResponse: Response;
  try {
    providerResponse = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin,
        "X-Title": "St. Joseph's College, Ombaci",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL,
        messages,
        max_tokens: 400,
        stream: true,
        prompt_cache_key: cacheKey,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });
  } catch (error) {
    console.error("The OpenRouter assistant service could not be reached.", error);
    return jsonError("The assistant is temporarily unavailable.", 503);
  }

  if (!providerResponse.ok || !providerResponse.body) {
    console.error(
      `The OpenRouter assistant service returned status ${providerResponse.status}.`,
    );
    return jsonError("The assistant is temporarily unavailable.", 503);
  }

  const headers = new Headers({
    "Cache-Control": "no-store, no-transform",
    "Content-Type": "text/event-stream; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  if (!hasVerification) {
    const token = createChatVerificationCookie();
    headers.set(
      "Set-Cookie",
      `${CHAT_VERIFICATION_COOKIE}=${token}; Max-Age=1800; Path=/api/chat; HttpOnly; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );
  }

  return new Response(
    streamAssistantResponse(
      providerResponse.body,
      parsed.data.messages.at(-1)?.content ?? "",
    ),
    { status: 200, headers },
  );
}
