import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthenticatedAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Help",
};

type HelpTopic = {
  id: string;
  title: string;
  keywords: string;
  steps: readonly string[];
  links: readonly { label: string; href: string }[];
};

const helpTopics: readonly HelpTopic[] = [
  {
    id: "sign-in",
    title: "Sign in, passwords and signing out",
    keywords: "login account password sign out administrator",
    steps: [
      "Open the school office sign-in page and enter your email address and password.",
      "Use the Sign out button at the bottom of the menu when you finish.",
      "If you need a password change, ask an administrator to open Users and reset your password. Sign in with the new password.",
    ],
    links: [{ label: "Open sign-in", href: "/admin/login" }],
  },
  {
    id: "edit-pages",
    title: "Change words on a page",
    keywords: "edit text about home admissions save publish",
    steps: [
      "Open Pages and choose the page you want to change.",
      "Edit the labelled fields. Use the writing hints under each field.",
      "Choose Save draft to keep a private copy, or Publish to show your changes on the website.",
      "Choose View on site to check the published page.",
    ],
    links: [
      { label: "Open website pages", href: "/admin/pages" },
      { label: "Edit About", href: "/admin/pages/about" },
    ],
  },
  {
    id: "photos",
    title: "Choose or upload a photo",
    keywords: "image picture alt text upload media sample photo library",
    steps: [
      "Open Photos and files and choose a photo to upload.",
      "Add a clear description for visitors who cannot see the photo. Add the source and credit when requested.",
      "Save the photo, then open the page or list entry where it belongs and choose it in the photo field.",
      "Save your edit as a draft or publish it. Sample photos and photos needing consent remain listed under Needs attention on the Dashboard.",
    ],
    links: [
      { label: "Open Photos and files", href: "/admin/media" },
      { label: "Open website pages", href: "/admin/pages" },
    ],
  },
  {
    id: "news",
    title: "Write, publish or hide a news article",
    keywords: "news story article publish hide delete",
    steps: [
      "Open News and choose Add new.",
      "Enter a title, web address ending, date, short description and article text. Add a photo if you have an approved one.",
      "Choose Publish when the article is ready for visitors.",
      "To hide an article, return to News and use its Hide action. Hiding keeps the article available to staff without showing it publicly.",
    ],
    links: [
      { label: "Open News", href: "/admin/news" },
      { label: "Write a news article", href: "/admin/news/new" },
    ],
  },
  {
    id: "notices",
    title: "Add, pin or expire a notice",
    keywords: "notice expiry date expire pin top bar",
    steps: [
      "Open Notices and choose Add new.",
      "Enter the notice text and, if needed, a start date and expiry date.",
      "Turn on Pin to the notice bar to show the notice above the website header.",
      "Choose Publish. Hide the notice or set its expiry date when it should no longer appear.",
    ],
    links: [
      { label: "Open Notices", href: "/admin/notices" },
      { label: "Add a notice", href: "/admin/notices/new" },
    ],
  },
  {
    id: "lists",
    title: "Manage staff, sports, facilities and other lists",
    keywords:
      "people staff sport facility achievement old boys event gallery album question faq reorder",
    steps: [
      "Choose the list from the menu, then choose Add new or Edit beside an entry.",
      "Fill in the labelled fields and choose Save draft or Publish.",
      "Use the move up and move down controls to change the order where they are available.",
      "Use Hide to remove an entry from the public website without deleting it.",
    ],
    links: [
      { label: "People", href: "/admin/people" },
      { label: "Sports", href: "/admin/sports" },
      { label: "Study and facilities", href: "/admin/facilities" },
      { label: "Questions and answers", href: "/admin/faqs" },
    ],
  },
  {
    id: "settings",
    title: "Change contact details, menu links and term dates",
    keywords:
      "settings phone email whatsapp social term date menu navigation footer",
    steps: [
      "Open Settings and change the fields for the phone number, email, WhatsApp, term dates or website links.",
      "To add a page to a menu, open the Navigation section and add its label and page address to the appropriate list.",
      "Choose Publish to make the changes live.",
    ],
    links: [{ label: "Open Settings", href: "/admin/settings" }],
  },
  {
    id: "applications",
    title: "Open or close applications",
    keywords: "application admissions open closed message",
    steps: [
      "Open Settings and turn Applications are open on or off, then Publish.",
      "When applications are closed, edit the Applications page to change the message visitors see.",
      "Open Applications to review submissions and update their status.",
    ],
    links: [
      { label: "Open Settings", href: "/admin/settings" },
      { label: "Edit the Applications page", href: "/admin/pages/admissions" },
      { label: "Review applications", href: "/admin/applications" },
    ],
  },
  {
    id: "messages",
    title: "Review applications and enquiries",
    keywords: "application enquiries messages status export csv download",
    steps: [
      "Open Applications to read a submission, review any attached documents and choose a new status.",
      "Use Download applications CSV or Download enquiries CSV to save a spreadsheet.",
      "Open Enquiries to read messages sent through the website contact form.",
    ],
    links: [
      { label: "Open Applications", href: "/admin/applications" },
      { label: "Open Enquiries", href: "/admin/enquiries" },
    ],
  },
  {
    id: "extra-pages",
    title: "Create a page and add it to a menu",
    keywords: "extra page custom add menu navigation",
    steps: [
      "Open Extra pages and choose Add new. Give the page a title and a web address ending.",
      "Write the page content, then publish it.",
      "To add it to a menu, open Settings, find Navigation and add the page address and link label.",
    ],
    links: [
      { label: "Open Extra pages", href: "/admin/extra-pages" },
      { label: "Open Settings", href: "/admin/settings" },
    ],
  },
  {
    id: "versions",
    title: "Restore an earlier version",
    keywords: "version history undo restore earlier changes",
    steps: [
      "Open the page or list entry you want to restore.",
      "Find Earlier versions below the editing form and open the version you need.",
      "Check the changes, then choose Restore this version. List entries are restored as a draft; publish them when ready.",
    ],
    links: [
      { label: "Open website pages", href: "/admin/pages" },
      { label: "Open News", href: "/admin/news" },
    ],
  },
  {
    id: "attention",
    title: "Clear items from Needs attention",
    keywords:
      "dashboard attention unconfirmed sample consent unanswered questions",
    steps: [
      "Open Dashboard and choose an item in Needs attention to go to the right part of the admin.",
      "Replace sample photos with approved school photos. Record consent before publishing a photo that shows a person.",
      "Review content details that still need confirmation and update them only when the school has confirmed the information.",
      "Use unanswered assistant questions to identify information that may need a clear answer on the website.",
    ],
    links: [
      { label: "Open Dashboard", href: "/admin" },
      { label: "Open Photos and files", href: "/admin/media" },
      { label: "Open Questions and answers", href: "/admin/faqs" },
    ],
  },
  {
    id: "users",
    title: "Add a staff account or reset a password",
    keywords: "users staff account add reset password role",
    steps: [
      "An administrator opens Users and adds the staff member's email address, temporary password and role.",
      "To reset a password, open that staff member's Reset password section, enter a new password and save it.",
      "Share the temporary password privately and ask the staff member to sign in.",
    ],
    links: [{ label: "Open Users", href: "/admin/users" }],
  },
  {
    id: "backup",
    title: "Download a content backup",
    keywords: "backup download pages settings lists photos restore",
    steps: [
      "Choose Download a backup of all content below.",
      "Store the downloaded file somewhere private and secure.",
      "The backup contains website content and photo details. It does not contain applications or private files.",
    ],
    links: [],
  },
];

export default async function AdminHelpPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const user = await getAuthenticatedAdmin();
  if (!user) redirect("/admin/login");
  if (user.role === "admissions") redirect("/admin/applications");

  const { q } = await searchParams;
  const searchTerm = Array.isArray(q) ? (q[0] ?? "") : (q ?? "");
  const query = searchTerm.trim().slice(0, 100).toLowerCase();
  const topics = helpTopics
    .filter((topic) => user.role === "admin" || topic.id !== "backup")
    .filter((topic) =>
      `${topic.title} ${topic.keywords} ${topic.steps.join(" ")}`
        .toLowerCase()
        .includes(query),
    );

  return (
    <div className="admin-page">
      <header className="admin-page-heading">
        <p className="admin-eyebrow">Help</p>
        <h1>Help with the school website</h1>
        <p>Find simple steps for common tasks in the school office.</p>
      </header>

      <form action="/admin/help" className="admin-search">
        <label className="admin-field">
          Search help
          <input
            autoComplete="off"
            defaultValue={searchTerm}
            maxLength={100}
            name="q"
            type="search"
          />
        </label>
        <button className="admin-button" type="submit">
          Search
        </button>
        {query ? (
          <Link className="admin-button" href="/admin/help">
            Clear search
          </Link>
        ) : null}
      </form>

      {topics.length > 0 ? (
        <div className="admin-help-topics">
          {topics.map((topic) => (
            <section
              aria-labelledby={`${topic.id}-heading`}
              className="admin-section admin-help-topic"
              key={topic.id}
            >
              <h2 id={`${topic.id}-heading`}>{topic.title}</h2>
              <ol>
                {topic.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="admin-help-links">
                {topic.links.map((link) => (
                  <Link
                    className="admin-button"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="admin-panel admin-empty" role="status">
          <p>No help topics match “{searchTerm}”. Try a different word.</p>
          <Link className="admin-button" href="/admin/help">
            Show all help
          </Link>
        </div>
      )}

      {user.role === "admin" ? (
        <section
          aria-labelledby="help-backup-heading"
          className="admin-section"
        >
          <h2 id="help-backup-heading">Keep a copy of your website content</h2>
          <p className="admin-muted">
            The backup includes pages, settings, lists, redirects and photo
            details. It does not include applications or private files.
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
    </div>
  );
}
