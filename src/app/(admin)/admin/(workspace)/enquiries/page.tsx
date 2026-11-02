import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { enquiries } from "@/db/schema";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Enquiries",
};

function displayValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).slice(0, 180);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined) return "";
  return (JSON.stringify(value) ?? String(value)).slice(0, 180);
}

export default async function AdminEnquiriesPage() {
  const user = await getAuthenticatedAdmin();
  if (!user) redirect("/admin/login");
  if (user.role === "editor") redirect("/admin");

  const records = await db
    .select()
    .from(enquiries)
    .orderBy(desc(enquiries.createdAt))
    .limit(100);

  return (
    <div className="admin-page">
      <header className="admin-page-heading">
        <p className="admin-eyebrow">Enquiries</p>
        <h1>School enquiries</h1>
        <p>Messages received through the school website.</p>
        <Link
          className="admin-button"
          href="/api/admin/applications/export?type=enquiries"
        >
          Download enquiries CSV
        </Link>
      </header>
      {records.length === 0 ? (
        <div className="admin-panel admin-empty">
          <p>No enquiries have been received yet.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Received</th>
                <th scope="col">Enquiry details</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <time dateTime={new Date(record.createdAt).toISOString()}>
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(record.createdAt)}
                    </time>
                  </td>
                  <td>
                    <dl className="admin-record-details">
                      {Object.entries(record.fields).map(([key, value]) => (
                        <div key={key}>
                          <dt>{key.replaceAll(/([A-Z])/g, " $1")}</dt>
                          <dd>{displayValue(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
