import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import {
  applicationFieldLabel,
  applicationFieldGroups,
} from "@/content/schemas/application-fields";
import { db } from "@/db/client";
import { applications, enquiries } from "@/db/schema";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

function csvCell(value: unknown) {
  let text =
    typeof value === "string"
      ? value
      : typeof value === "number" || typeof value === "boolean"
        ? String(value)
        : "";
  if (/^[\t\r\n ]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function csvResponse(filename: string, rows: readonly (readonly unknown[])[]) {
  const body = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  return new NextResponse(`\uFEFF${body}`, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedAdmin();
  if (!user || user.role === "editor") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const type = request.nextUrl.searchParams.get("type") ?? "applications";
  if (type === "applications") {
    const records = await db
      .select()
      .from(applications)
      .orderBy(desc(applications.createdAt));
    const knownFieldNames = applicationFieldGroups.flatMap(
      (group) => group.fields,
    );
    const knownFields = new Set<string>(knownFieldNames);
    const historicalFieldNames = [
      ...new Set(
        records.flatMap((record) =>
          Object.keys(record.fields).filter(
            (field) => !knownFields.has(field) && field !== "consent",
          ),
        ),
      ),
    ].sort();
    const fieldNames = [...knownFieldNames, ...historicalFieldNames];
    const headers = [
      "Reference",
      "Status",
      "Received",
      ...fieldNames.map(applicationFieldLabel),
    ];
    const rows = records.map((record) => [
      record.id,
      record.status,
      new Date(record.createdAt).toISOString(),
      ...fieldNames.map((field) => record.fields[field] ?? ""),
    ]);
    return csvResponse("ombaci-applications.csv", [headers, ...rows]);
  }

  if (type === "enquiries") {
    const records = await db
      .select()
      .from(enquiries)
      .orderBy(desc(enquiries.createdAt));
    const rows = records.map((record) => [
      record.id,
      new Date(record.createdAt).toISOString(),
      record.fields.name ?? "",
      record.fields.email ?? "",
      record.fields.phone ?? "",
      record.fields.subject ?? "",
      record.fields.message ?? "",
    ]);
    return csvResponse("ombaci-enquiries.csv", [
      ["Reference", "Received", "Name", "Email", "Phone", "Subject", "Message"],
      ...rows,
    ]);
  }

  return NextResponse.json({ error: "Unknown export type." }, { status: 400 });
}
