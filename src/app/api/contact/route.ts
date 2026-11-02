import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { contactEnquirySchema } from "@/content/schemas/application-fields";
import { db } from "@/db/client";
import { enquiries } from "@/db/schema";
import {
  assertEmailConfigured,
  EmailDeliveryError,
  sendEnquiryEmail,
} from "@/lib/admissions/email";
import {
  consumeSubmissionLimit,
  getClientAddress,
} from "@/lib/admissions/rate-limit";
import { TurnstileError, verifyTurnstile } from "@/lib/admissions/turnstile";
import { isSameOrigin } from "@/lib/admin/same-origin";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "This request could not be verified." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const contentLengthHeader = request.headers.get("content-length");
  if (
    contentLengthHeader !== null &&
    (!/^\d+$/.test(contentLengthHeader) ||
      Number(contentLengthHeader) > 16 * 1024)
  ) {
    return NextResponse.json(
      { error: "The contact message is too large." },
      {
        status: Number(contentLengthHeader) > 16 * 1024 ? 413 : 400,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  let address: string;
  try {
    address = getClientAddress(request.headers);
  } catch {
    return NextResponse.json(
      { error: "The form is temporarily unavailable. Please try again." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const limit = await consumeSubmissionLimit("contact", address);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Please wait before sending another message." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(limit.retryAfterSeconds),
        },
      },
    );
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 16 * 1024) {
      return NextResponse.json(
        { error: "The contact message is too large." },
        { status: 413, headers: { "Cache-Control": "no-store" } },
      );
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Please check the contact form and try again." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const result = contactEnquirySchema.safeParse(
    body && typeof body === "object" && "fields" in body
      ? body.fields
      : undefined,
  );
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Please correct the marked contact details.",
        fieldErrors: result.error.flatten().fieldErrors,
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const token =
    body && typeof body === "object" && "turnstileToken" in body
      ? body.turnstileToken
      : undefined;
  if (typeof token !== "string" || token.length < 1 || token.length > 2048) {
    return NextResponse.json(
      { error: "Please complete the security check and try again." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    assertEmailConfigured();
    await verifyTurnstile(token, address);
  } catch (error) {
    if (
      error instanceof EmailDeliveryError ||
      error instanceof TurnstileError
    ) {
      return NextResponse.json(
        { error: error.message },
        {
          status: error instanceof TurnstileError ? error.status : 503,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }
    throw error;
  }

  const id = randomUUID();
  const now = Date.now();
  await db.insert(enquiries).values({
    id,
    fields: result.data,
    createdAt: now,
  });

  try {
    await sendEnquiryEmail(result.data);
  } catch (error) {
    if (error instanceof EmailDeliveryError) {
      return NextResponse.json(
        {
          enquiryReceived: true,
          message:
            "The school received your message, but could not send an email notice. Please call the school if your enquiry is urgent.",
        },
        { status: 202, headers: { "Cache-Control": "no-store" } },
      );
    }
    throw error;
  }

  return NextResponse.json(
    { enquiryReceived: true },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
