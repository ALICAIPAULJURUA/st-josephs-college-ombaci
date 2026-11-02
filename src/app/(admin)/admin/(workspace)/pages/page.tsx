import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { pageSchemas } from "@/content/schemas/registry";
import { db } from "@/db/client";
import { pages } from "@/db/schema";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Pages",
};

function pageStatus(record: typeof pages.$inferSelect | undefined) {
  if (!record) return "Hidden";
  if (record.draftFields) {
    return record.status === "published" ? "Published with draft" : "Draft";
  }
  return record.status === "published" ? "Published" : "Hidden";
}

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const user = await getAuthenticatedAdmin();
  if (!user) redirect("/admin/login");
  if (user.role === "admissions") redirect("/admin/applications");

  const params = await searchParams;
  const query = params.q?.trim().slice(0, 100).toLowerCase() ?? "";
  const statusFilter = ["published", "draft", "hidden"].includes(
    params.status ?? "",
  )
    ? params.status
    : "";
  const schemas = pageSchemas.filter(
    (schema) => schema.key !== "settings",
  );
  const pageRows = await db.select().from(pages);
  const rowByKey = new Map(pageRows.map((row) => [row.key, row]));
  const pageEntries = schemas
    .map((schema) => {
      const record = rowByKey.get(schema.key);
      return {
        schema,
        record,
        status: pageStatus(record),
        editedAt: record?.draftUpdatedAt ?? record?.updatedAt,
      };
    })
    .filter(({ schema, status }) => {
      const matchesQuery =
        !query ||
        schema.label.toLowerCase().includes(query) ||
        schema.route.toLowerCase().includes(query);
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "published" && status.startsWith("Published")) ||
        (statusFilter === "draft" && status === "Draft") ||
        (statusFilter === "hidden" && status === "Hidden");
      return matchesQuery && matchesStatus;
    });

  return (
    <div className="admin-page">
      <header className="admin-page-heading">
        <p className="admin-eyebrow">Pages</p>
        <h1>Website pages</h1>
        <p>
          Edit a page&apos;s words and photos. Changes to live pages stay
          private until published.
        </p>
      </header>

      <form action="/admin/pages" className="admin-search">
        <label className="admin-field">
          Search pages
          <input defaultValue={params.q ?? ""} maxLength={100} name="q" />
        </label>
        <label className="admin-field">
          Status
          <select defaultValue={statusFilter} name="status">
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>
        <button className="admin-button" type="submit">
          Search
        </button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Page</th>
              <th scope="col">Status</th>
              <th scope="col">Last edited</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageEntries.map(({ schema, status, editedAt }) => (
              <tr key={schema.key}>
                <th scope="row">
                  {schema.label}
                  <span className="admin-table-secondary">{schema.route}</span>
                </th>
                <td>{status}</td>
                <td>
                  {editedAt
                    ? new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                      }).format(editedAt)
                    : "Not edited"}
                </td>
                <td>
                  <Link
                    className="admin-button"
                    href={`/admin/pages/${schema.key}`}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {pageEntries.length === 0 ? (
              <tr>
                <td colSpan={4}>No pages match those filters.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
