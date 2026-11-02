import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getCollectionSchema } from "@/content/schemas/collections";
import { getPageSchema } from "@/content/schemas/registry";
import { db } from "@/db/client";
import {
  applications,
  chatLog,
  enquiries,
  items,
  media,
  pages,
  settings,
} from "@/db/schema";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";

type AttentionMarker = {
  id: string;
  location: string;
  text: string;
  href: string;
};

type RecentEdit = {
  id: string;
  title: string;
  href: string;
  updatedAt: number;
};

function findAttentionMarkers(
  value: unknown,
  location: string,
  href: string,
  results: AttentionMarker[],
) {
  if (typeof value === "string") {
    const pattern =
      /\[To be confirmed:[^\]]+\]|photo coming soon|to be confirmed|being confirmed|when they have been confirmed|replace before publishing|replace with approved photos|^\s*draft\b|old boy name|class, profession/gi;
    for (const match of value.matchAll(pattern)) {
      results.push({
        id: `${location}:${match.index ?? results.length}`,
        location,
        text: match[0],
        href,
      });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      findAttentionMarkers(entry, `${location}[${index}]`, href, results),
    );
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      findAttentionMarkers(entry, `${location}.${key}`, href, results);
    }
  }
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

export default async function AdminDashboardPage() {
  const user = await getAuthenticatedAdmin();
  if (!user) redirect("/admin/login");
  if (user.role === "admissions") redirect("/admin/applications");

  const [
    samplePhotos,
    samplePhotoRows,
    consentNeeded,
    latestUploads,
    unansweredQuestions,
    pageRows,
    itemRows,
    settingsRows,
    newApplications,
    enquiryCount,
  ] = await Promise.all([
    db.select({ total: count() }).from(media).where(eq(media.isSample, true)),
    db
      .select({
        id: media.id,
        alt: media.alt,
        credit: media.credit,
      })
      .from(media)
      .where(eq(media.isSample, true))
      .orderBy(desc(media.createdAt)),
    db
      .select({ total: count() })
      .from(media)
      .where(
        and(
          eq(media.hasPeople, true),
          eq(media.isSample, false),
          eq(media.consentRecorded, false),
        ),
      ),
    db.select().from(media).orderBy(desc(media.createdAt)).limit(5),
    db
      .select({
        id: chatLog.id,
        question: chatLog.question,
        createdAt: chatLog.createdAt,
      })
      .from(chatLog)
      .where(eq(chatLog.answered, false))
      .orderBy(desc(chatLog.createdAt))
      .limit(10),
    db.select().from(pages),
    db.select().from(items),
    db.select().from(settings),
    db
      .select({ total: count() })
      .from(applications)
      .where(eq(applications.status, "new")),
    db.select({ total: count() }).from(enquiries),
  ]);
  const sampleCount = samplePhotos[0]?.total ?? 0;
  const consentCount = consentNeeded[0]?.total ?? 0;
  const applicationCount = newApplications[0]?.total ?? 0;
  const enquiriesToReview = enquiryCount[0]?.total ?? 0;

  const attentionMarkers: AttentionMarker[] = [];
  for (const page of pageRows) {
    const label = getPageSchema(page.key)?.label ?? page.key;
    findAttentionMarkers(
      page.fields,
      label,
      `/admin/pages/${page.key}`,
      attentionMarkers,
    );
  }
  for (const item of itemRows) {
    const schema = getCollectionSchema(item.collection);
    findAttentionMarkers(
      item.fields,
      `${schema?.label ?? item.collection}: ${displayTitle(item.fields, item.slug)}`,
      `/admin/${item.collection}/${encodeURIComponent(item.id)}`,
      attentionMarkers,
    );
  }
  for (const setting of settingsRows) {
    findAttentionMarkers(
      setting.value,
      `Settings: ${setting.key}`,
      "/admin/settings",
      attentionMarkers,
    );
  }

  const recentEdits: RecentEdit[] = [
    ...pageRows.map((page) => {
      const schema = getPageSchema(page.key);
      return {
        id: `page:${page.key}`,
        title: schema?.label ?? page.key,
        href: `/admin/pages/${page.key}`,
        updatedAt: page.draftUpdatedAt ?? page.updatedAt,
      };
    }),
    ...itemRows.map((item) => {
      const schema = getCollectionSchema(item.collection);
      return {
        id: `item:${item.id}`,
        title: `${schema?.label ?? item.collection}: ${displayTitle(item.fields, item.slug)}`,
        href: `/admin/${item.collection}/${encodeURIComponent(item.id)}`,
        updatedAt: item.updatedAt,
      };
    }),
  ]
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .slice(0, 5);

  return (
    <div className="admin-page">
      <header className="admin-page-heading">
        <p className="admin-eyebrow">Dashboard</p>
        <h1>Welcome to the school office</h1>
        <p>Manage the school website from one place.</p>
      </header>

      <section
        aria-labelledby="needs-attention"
        className="admin-panel admin-attention"
      >
        <div>
          <p className="admin-eyebrow">A helpful reminder</p>
          <h2 id="needs-attention">Needs attention</h2>
        </div>
        <ul className="admin-attention-list">
          <li>
            <Link href="/admin/media">
              <strong>{sampleCount}</strong>
              <span>
                sample {sampleCount === 1 ? "photo" : "photos"} to replace
              </span>
            </Link>
          </li>
          <li>
            <Link href="/admin/media">
              <strong>{consentCount}</strong>
              <span>
                {consentCount === 1 ? "photo needs" : "photos need"} consent
                before it can be published
              </span>
            </Link>
          </li>
          <li>
            <Link href="/admin/pages">
              <strong>{attentionMarkers.length}</strong>
              <span>
                {attentionMarkers.length === 1
                  ? "content detail"
                  : "content details"}{" "}
                to confirm
              </span>
            </Link>
          </li>
          <li>
            <Link href="/admin/applications">
              <strong>{applicationCount}</strong>
              <span>
                new {applicationCount === 1 ? "application" : "applications"}
              </span>
            </Link>
          </li>
          <li>
            <Link href="/admin/enquiries">
              <strong>{enquiriesToReview}</strong>
              <span>
                enquiry {enquiriesToReview === 1 ? "message" : "messages"}{" "}
                received
              </span>
            </Link>
          </li>
        </ul>
        {attentionMarkers.length > 0 ? (
          <ul className="admin-sample-list">
            {attentionMarkers.slice(0, 10).map((marker) => (
              <li key={marker.id}>
                <Link href={marker.href}>
                  {marker.location}: {marker.text}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {samplePhotoRows.length > 0 ? (
          <>
            <ul className="admin-sample-list">
              {samplePhotoRows.map((sample) => (
                <li key={sample.id}>
                  {sample.alt}
                  {sample.credit ? ` — ${sample.credit}` : ""}
                </li>
              ))}
            </ul>
            <p className="admin-muted">
              <Link href="/admin/media">Review sample photos</Link>
            </p>
          </>
        ) : null}
      </section>

      {unansweredQuestions.length > 0 ? (
        <section
          aria-labelledby="unanswered-questions-heading"
          className="admin-section"
        >
          <div className="admin-section-heading">
            <h2 id="unanswered-questions-heading">
              Questions we could not answer
            </h2>
            <Link href="/admin/faqs">Review questions and answers</Link>
          </div>
          <p className="admin-muted">
            Use these anonymous questions to identify information the website
            could explain more clearly.
          </p>
          <ul className="admin-chat-questions">
            {unansweredQuestions.map((entry) => (
              <li key={entry.id}>
                <span>{entry.question}</span>
                <time dateTime={new Date(entry.createdAt).toISOString()}>
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(entry.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="shortcuts-heading" className="admin-section">
        <h2 id="shortcuts-heading">Quick links</h2>
        <div className="admin-shortcuts">
          <Link className="admin-shortcut" href="/admin/media">
            <strong>Upload photos</strong>
            <span>Add a photo or document to the library.</span>
          </Link>
          <Link className="admin-shortcut" href="/admin/news/new">
            <strong>Write a news article</strong>
            <span>Write a story and publish it on the website.</span>
          </Link>
          <Link className="admin-shortcut" href="/admin/notices/new">
            <strong>Add a notice</strong>
            <span>Share an update or pin it to the notice bar.</span>
          </Link>
        </div>
      </section>

      {user.role === "admin" ? (
        <section aria-labelledby="backup-heading" className="admin-section">
          <div className="admin-section-heading">
            <h2 id="backup-heading">Content backup</h2>
          </div>
          <p className="admin-muted">
            Download pages, settings, lists, redirects, and the photo library
            details. Applications and private files are not included.
          </p>
          <Link
            className="admin-button admin-button-primary"
            download
            href="/api/admin/backup"
            prefetch={false}
          >
            Download a backup of all content
          </Link>
        </section>
      ) : null}

      <section
        aria-labelledby="recent-uploads-heading"
        className="admin-section"
      >
        <div className="admin-section-heading">
          <h2 id="recent-uploads-heading">Recent photo uploads</h2>
          <Link href="/admin/media">Open photos and files</Link>
        </div>
        {latestUploads.length === 0 ? (
          <div className="admin-panel admin-empty">
            <p>No photos have been uploaded yet.</p>
            <Link
              className="admin-button admin-button-primary"
              href="/admin/media"
            >
              Upload a photo
            </Link>
          </div>
        ) : (
          <ul className="admin-recent-list">
            {latestUploads.map((item) => (
              <li key={item.id}>
                <span>{item.alt}</span>
                <time dateTime={new Date(item.createdAt).toISOString()}>
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                  }).format(item.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="recent-edits-heading" className="admin-section">
        <div className="admin-section-heading">
          <h2 id="recent-edits-heading">Recently edited</h2>
        </div>
        {recentEdits.length > 0 ? (
          <ul className="admin-recent-list">
            {recentEdits.map((edit) => (
              <li key={edit.id}>
                <Link href={edit.href}>{edit.title}</Link>
                <time dateTime={new Date(edit.updatedAt).toISOString()}>
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(edit.updatedAt)}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <div className="admin-panel admin-empty">
            <p>Saved page and list changes will appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
}
