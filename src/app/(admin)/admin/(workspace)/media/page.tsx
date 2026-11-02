import type { Metadata } from "next";
import { desc, like, or } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { media } from "@/db/schema";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { getMediaUrl } from "@/lib/admin/storage";
import { MediaCard } from "./media-card";
import { MediaUploadForm } from "./upload-form";

export const metadata: Metadata = {
  title: "Photos and files",
};

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getAuthenticatedAdmin();
  if (!user) redirect("/admin/login");
  if (user.role === "admissions") redirect("/admin/applications");

  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 100);
  const matchingMedia = await db
    .select()
    .from(media)
    .where(
      query
        ? or(
            like(media.alt, `%${query}%`),
            like(media.credit, `%${query}%`),
            like(media.licence, `%${query}%`),
            like(media.sourceUrl, `%${query}%`),
          )
        : undefined,
    )
    .orderBy(desc(media.createdAt))
    .limit(100);

  return (
    <div className="admin-page">
      <header className="admin-page-heading">
        <p className="admin-eyebrow">Photos and files</p>
        <h1>Photo library</h1>
        <p>Upload and manage school photos. Add alt text and image credits.</p>
      </header>

      <MediaUploadForm />

      <section aria-labelledby="library-heading" className="admin-section">
        <div className="admin-section-heading">
          <h2 id="library-heading">Photos and files</h2>
          <span>{matchingMedia.length} shown (up to 100)</span>
        </div>
        <form action="/admin/media" className="admin-search">
          <label className="admin-field">
            Search alt text, credit or licence
            <input defaultValue={query} maxLength={100} name="q" />
          </label>
          <button className="admin-button" type="submit">
            Search
          </button>
        </form>
        {matchingMedia.length > 0 ? (
          <div className="admin-media-grid">
            {matchingMedia.map((item) => (
              <MediaCard
                item={{
                  ...item,
                  url: getMediaUrl(item.file),
                }}
                key={item.id}
              />
            ))}
          </div>
        ) : (
          <div className="admin-panel admin-empty">
            <p>
              {query
                ? "No photos match that search. Try another word."
                : "No photos have been uploaded yet."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
