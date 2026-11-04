import type { Metadata } from "next";
import Link from "next/link";
import { desc, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";

import {
  applicationFieldLabel,
  applicationFieldGroups,
  applicationStatusSchema,
  type ApplicationStatus,
} from "@/content/schemas/application-fields";
import { db } from "@/db/client";
import {
  applicationFiles,
  applicationStatusHistory,
  applications,
} from "@/db/schema";
import { createApplicationFileUrl } from "@/lib/admissions/file-links";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { changeApplicationStatusAction } from "./actions";

export const metadata: Metadata = {
  title: "Applications",
};

const statuses: readonly ApplicationStatus[] = applicationStatusSchema.options;
const statusLabels: Record<ApplicationStatus, string> = {
  new: "New",
  in_review: "In review",
  interview_invited: "Interview invited",
  offer_made: "Offer made",
  declined: "Declined",
  closed: "Closed",
};
const knownApplicationFields = new Set<string>(
  applicationFieldGroups.flatMap((group) => group.fields),
);

function displayValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).slice(0, 500);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined) return "";
  return (JSON.stringify(value) ?? String(value)).slice(0, 500);
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const user = await getAuthenticatedAdmin();
  if (!user) redirect("/admin/login");
  if (user.role === "editor") redirect("/admin");

  const [{ notice }, records] = await Promise.all([
    searchParams,
    db
      .select()
      .from(applications)
      .orderBy(desc(applications.createdAt))
      .limit(100),
  ]);
  const recordIds = records.map((record) => record.id);
  const [history, files] =
    recordIds.length > 0
      ? await Promise.all([
          db
            .select()
            .from(applicationStatusHistory)
            .where(inArray(applicationStatusHistory.applicationId, recordIds))
            .orderBy(desc(applicationStatusHistory.createdAt)),
          db
            .select()
            .from(applicationFiles)
            .where(inArray(applicationFiles.applicationId, recordIds)),
        ])
      : [[], []];
  const historyByApplication = new Map<string, typeof history>();
  for (const entry of history) {
    const entries = historyByApplication.get(entry.applicationId) ?? [];
    entries.push(entry);
    historyByApplication.set(entry.applicationId, entries);
  }
  const filesByApplication = new Map<string, typeof files>();
  for (const file of files) {
    const entries = filesByApplication.get(file.applicationId) ?? [];
    entries.push(file);
    filesByApplication.set(file.applicationId, entries);
  }

  return (
    <div className="admin-page">
      <header className="admin-page-heading">
        <p className="admin-eyebrow">Applications</p>
        <h1>Admissions applications</h1>
        <p>New applications received through the school website.</p>
        <Link
          className="admin-button"
          href="/api/admin/applications/export?type=applications"
        >
          Download applications CSV
        </Link>
      </header>
      {notice === "status-updated" ? (
        <p className="admin-status" role="status">
          Application status updated.
        </p>
      ) : null}
      {records.length === 0 ? (
        <div className="admin-panel admin-empty">
          <p>No applications have been received yet.</p>
        </div>
      ) : (
        <div className="admin-application-list">
          {records.map((record) => {
            const fieldGroups = applicationFieldGroups.map((group) => ({
              label: group.label,
              values: group.fields
                .map((field) => [field, record.fields[field]] as const)
                .filter(([, value]) => value !== undefined && value !== ""),
            }));
            const legacyValues = Object.entries(record.fields).filter(
              ([field, value]) =>
                !knownApplicationFields.has(field) &&
                field !== "consent" &&
                value !== undefined &&
                value !== "",
            );
            const recordFiles = filesByApplication.get(record.id) ?? [];
            const recordHistory = historyByApplication.get(record.id) ?? [];

            return (
              <article className="admin-application-card" key={record.id}>
                <header className="admin-application-heading">
                  <div>
                    <p className="admin-eyebrow">Reference</p>
                    <h2>{record.id}</h2>
                    <time dateTime={new Date(record.createdAt).toISOString()}>
                      Received{" "}
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(record.createdAt)}
                    </time>
                  </div>
                  <form action={changeApplicationStatusAction}>
                    <input
                      name="applicationId"
                      type="hidden"
                      value={record.id}
                    />
                    <label className="admin-field">
                      Status
                      <select defaultValue={record.status} name="status">
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="admin-button" type="submit">
                      Save status
                    </button>
                  </form>
                </header>
                <div className="admin-application-groups">
                  {fieldGroups.map((group) => (
                    <section key={group.label}>
                      <h3>{group.label}</h3>
                      <dl className="admin-record-details">
                        {group.values.map(([key, value]) => (
                          <div key={key}>
                            <dt>{applicationFieldLabel(key)}</dt>
                            <dd>{displayValue(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  ))}
                  {legacyValues.length > 0 ? (
                    <section>
                      <h3>Earlier application details</h3>
                      <dl className="admin-record-details">
                        {legacyValues.map(([key, value]) => (
                          <div key={key}>
                            <dt>{applicationFieldLabel(key)}</dt>
                            <dd>{displayValue(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  ) : null}
                </div>
                {recordFiles.length > 0 ? (
                  <section className="admin-application-files">
                    <h3>Private documents</h3>
                    <ul>
                      {recordFiles.map((file) => (
                        <li key={file.id}>
                          <Link
                            href={createApplicationFileUrl(file.id)}
                            rel="noreferrer"
                          >
                            {file.originalName}
                          </Link>
                          <span> ({Math.ceil(file.size / 1024)} KB)</span>
                        </li>
                      ))}
                    </ul>
                    <p>Links expire after five minutes and require sign-in.</p>
                  </section>
                ) : null}
                <details className="admin-application-history">
                  <summary>Status history</summary>
                  <ol>
                    {recordHistory.map((entry) => (
                      <li key={entry.id}>
                        <strong>{statusLabels[entry.status]}</strong>
                        <span>
                          {" "}
                          —{" "}
                          {new Intl.DateTimeFormat("en", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(entry.createdAt)}
                        </span>
                        <span>
                          {entry.actorId
                            ? " · Updated by staff"
                            : " · Submitted by applicant"}
                        </span>
                      </li>
                    ))}
                  </ol>
                </details>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
