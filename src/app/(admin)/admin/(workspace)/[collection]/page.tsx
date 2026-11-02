import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

import { getCollectionSchema } from "@/content/schemas/collections";
import { db } from "@/db/client";
import { items } from "@/db/schema";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { ListItemRowActions } from "../list-item-row-actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection } = await params;
  const schema = getCollectionSchema(collection);
  return { title: schema?.label ?? "Content" };
}

function displayTitle(fields: Record<string, unknown>, fallback: string) {
  for (const key of ["title", "name", "question", "year"]) {
    const value = fields[key];
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
  }
  return fallback;
}

export default async function AdminCollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const [{ collection }, filters] = await Promise.all([params, searchParams]);
  const schema = getCollectionSchema(collection);
  if (!schema) notFound();

  const user = await getAuthenticatedAdmin();
  if (!user) redirect("/admin/login");
  if (user.role === "admissions") redirect("/admin/applications");

  const query = filters.q?.trim().slice(0, 100).toLowerCase() ?? "";
  const statusFilter = ["published", "hidden"].includes(filters.status ?? "")
    ? filters.status
    : "";
  const allItems = await db
    .select()
    .from(items)
    .where(eq(items.collection, schema.key))
    .orderBy(items.sortOrder);
  const visibleItems = allItems.filter((item) => {
    const statusMatches = !statusFilter || item.status === statusFilter;
    const title = displayTitle(item.fields, item.slug).toLowerCase();
    const searchMatches =
      !query ||
      title.includes(query) ||
      item.slug.toLowerCase().includes(query);
    return statusMatches && searchMatches;
  });

  return (
    <div className="admin-page">
      <header className="admin-page-heading">
        <p className="admin-eyebrow">{schema.label}</p>
        <h1>{schema.label}</h1>
        <p>Find an entry, make changes or add something new.</p>
      </header>

      <form action={`/admin/${schema.key}`} className="admin-search">
        <label className="admin-field">
          Search {schema.label.toLowerCase()}
          <input defaultValue={filters.q ?? ""} maxLength={100} name="q" />
        </label>
        <label className="admin-field">
          Status
          <select defaultValue={statusFilter} name="status">
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="hidden">Draft or hidden</option>
          </select>
        </label>
        <button className="admin-button" type="submit">
          Search
        </button>
        <Link
          className="admin-button admin-button-primary"
          href={`/admin/${schema.key}/new`}
        >
          Add new
        </Link>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Entry</th>
              <th scope="col">Status</th>
              <th scope="col">Last edited</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item, index) => (
              <tr key={item.id}>
                <th scope="row">
                  {displayTitle(item.fields, item.slug)}
                  <span className="admin-table-secondary">{item.slug}</span>
                </th>
                <td>{item.status === "published" ? "Published" : "Draft or hidden"}</td>
                <td>
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                  }).format(item.updatedAt)}
                </td>
                <td>
                  <ListItemRowActions
                    editHref={`/admin/${schema.key}/${encodeURIComponent(item.id)}`}
                    id={item.id}
                    isFirst={index === 0}
                    isLast={index === visibleItems.length - 1}
                    schema={schema}
                    status={item.status}
                  />
                </td>
              </tr>
            ))}
            {visibleItems.length === 0 ? (
              <tr>
                <td colSpan={4}>No entries match those filters.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
