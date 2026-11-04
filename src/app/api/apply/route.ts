import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import {
  applicationDocumentDefinitions,
  applicationFieldsSchema,
} from "@/content/schemas/application-fields";
import { db } from "@/db/client";
import {
  applicationFiles,
  applicationStatusHistory,
  applications,
  settings,
} from "@/db/schema";
import {
  EmailDeliveryError,
  sendApplicationEmails,
} from "@/lib/admissions/email";
import {
  consumeSubmissionLimit,
  getClientAddress,
} from "@/lib/admissions/rate-limit";
import {
  removePrivateApplicationFile,
  savePrivateApplicationFile,
  validateApplicationFile,
  type PendingApplicationFile,
} from "@/lib/admissions/private-files";
import { TurnstileError, verifyTurnstile } from "@/lib/admissions/turnstile";
import { isSameOrigin } from "@/lib/admin/same-origin";
import { isApplicationSubmissionConfigured } from "@/lib/admissions/readiness";

export const runtime = "nodejs";

function jsonError(message: string, status: number, fieldErrors?: unknown) {
  return NextResponse.json(
    { error: message, ...(fieldErrors ? { fieldErrors } : {}) },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

async function applicationsAreOpen() {
  const [value] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, "applicationsOpen"))
    .limit(1);
  return value?.value === true;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return jsonError("This request could not be verified.", 403);
  }
  if (!(await applicationsAreOpen())) {
    return jsonError("Online applications are currently closed.", 409);
  }
  if (!isApplicationSubmissionConfigured()) {
    return jsonError(
      "Online applications are temporarily unavailable. Please contact the school.",
      503,
    );
  }

  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader !== null && !/^\d+$/.test(contentLengthHeader)) {
    return jsonError("The uploaded documents could not be read.", 400);
  }
  const contentLength = Number(contentLengthHeader ?? 0);
  if (contentLength > 17 * 1024 * 1024) {
    return jsonError(
      "The uploaded documents exceed the 15 MB total limit.",
      413,
    );
  }

  let address: string;
  try {
    address = getClientAddress(request.headers);
  } catch {
    return jsonError(
      "The form is temporarily unavailable. Please try again.",
      503,
    );
  }

  const limit = await consumeSubmissionLimit("application", address);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Please wait before submitting another application." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(limit.retryAfterSeconds),
        },
      },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("The application form could not be read.", 400);
  }

  const rawFields = formData.get("application");
  if (typeof rawFields !== "string") {
    return jsonError("Please check the application fields and try again.", 400);
  }

  let decodedFields: unknown;
  try {
    decodedFields = JSON.parse(rawFields);
  } catch {
    return jsonError("Please check the application fields and try again.", 400);
  }
  const fieldsResult = applicationFieldsSchema.safeParse(decodedFields);
  if (!fieldsResult.success) {
    return jsonError(
      "Please correct the marked application details.",
      400,
      fieldsResult.error.flatten().fieldErrors,
    );
  }

  const token = formData.get("turnstileToken");
  if (typeof token !== "string" || token.length < 1 || token.length > 2048) {
    return jsonError("Please complete the security check and try again.", 400);
  }

  const allowedNames = new Set(
    applicationDocumentDefinitions.map(({ name }) => name),
  );
  const submittedFiles: PendingApplicationFile[] = [];
  let totalFileSize = 0;
  for (const [fieldName, value] of formData.entries()) {
    if (fieldName === "application" || fieldName === "turnstileToken") continue;
    if (
      !allowedNames.has(
        fieldName as (typeof applicationDocumentDefinitions)[number]["name"],
      )
    ) {
      return jsonError("An unrecognised document was submitted.", 400);
    }
    if (!(value instanceof File)) {
      return jsonError("A document upload could not be read.", 400);
    }
    if (formData.getAll(fieldName).length !== 1) {
      return jsonError(
        "Only one file may be uploaded in each document field.",
        400,
      );
    }

    try {
      const file = await validateApplicationFile(
        fieldName as PendingApplicationFile["fieldName"],
        value,
      );
      if (file) {
        totalFileSize += file.size;
        if (totalFileSize > 15 * 1024 * 1024) {
          return jsonError(
            "The uploaded documents exceed the 15 MB total limit.",
            413,
          );
        }
        submittedFiles.push(file);
      }
    } catch (error) {
      if (error instanceof Error) return jsonError(error.message, 400);
      throw error;
    }
  }

  try {
    await verifyTurnstile(token, address);
  } catch (error) {
    if (error instanceof TurnstileError) {
      return jsonError(error.message, error.status);
    }
    throw error;
  }

  const id = randomUUID();
  const now = Date.now();
  const storedFiles: PendingApplicationFile[] = [];

  try {
    for (const file of submittedFiles) {
      await savePrivateApplicationFile(file);
      storedFiles.push(file);
    }

    await db.transaction(async (tx) => {
      await tx.insert(applications).values({
        id,
        status: "new",
        fields: fieldsResult.data,
        createdAt: now,
        updatedAt: now,
      });
      await tx.insert(applicationStatusHistory).values({
        id: randomUUID(),
        applicationId: id,
        status: "new",
        actorId: null,
        createdAt: now,
      });
      if (storedFiles.length > 0) {
        await tx.insert(applicationFiles).values(
          storedFiles.map((file) => ({
            id: file.id,
            applicationId: id,
            storageKey: file.storageKey,
            fieldName: file.fieldName,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            createdAt: now,
          })),
        );
      }
    });
  } catch (error) {
    await Promise.all(
      storedFiles.map((file) => removePrivateApplicationFile(file.storageKey)),
    );
    throw error;
  }

  try {
    await sendApplicationEmails(fieldsResult.data.guardianEmail, id);
  } catch (error) {
    if (error instanceof EmailDeliveryError) {
      return NextResponse.json(
        {
          reference: id,
          applicationReceived: true,
          message:
            "The school received your application, but could not send the email notice. Keep your reference and contact the school if you need help.",
        },
        { status: 202, headers: { "Cache-Control": "no-store" } },
      );
    }
    throw error;
  }

  return NextResponse.json(
    { reference: id, applicationReceived: true },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
