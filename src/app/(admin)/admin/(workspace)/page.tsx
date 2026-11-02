import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { chatLog, media } from "@/db/schema";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";

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
  ]);
  const sampleCount = samplePhotos[0]?.total ?? 0;
  const consentCount = consentNeeded[0]?.total ?? 0;

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
            <strong>{sampleCount}</strong>
            <span>
              sample {sampleCount === 1 ? "photo" : "photos"} to replace
            </span>
          </li>
          <li>
            <strong>{consentCount}</strong>
            <span>
              {consentCount === 1 ? "photo needs" : "photos need"} consent
              before it can be published
            </span>
          </li>
        </ul>
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
          <span
            aria-disabled="true"
            className="admin-shortcut admin-shortcut-disabled"
          >
            <strong>Write a news article</strong>
            <span>Available in a later phase.</span>
          </span>
          <span
            aria-disabled="true"
            className="admin-shortcut admin-shortcut-disabled"
          >
            <strong>Add a notice</strong>
            <span>Available in a later phase.</span>
          </span>
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
    </div>
  );
}
