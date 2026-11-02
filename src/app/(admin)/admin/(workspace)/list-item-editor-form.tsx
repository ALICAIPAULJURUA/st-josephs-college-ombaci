"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import type { Field, PageSchema } from "@/content/schemas";
import {
  restoreCollectionItemRevisionAction,
  saveCollectionItemAction,
  type ListActionState,
} from "./list-actions";
import type { EditorMediaItem } from "./media-picker";
import { FieldEditor } from "./field-editor";
import { contentItemPath } from "@/lib/content-path";

type Values = Record<string, unknown>;

type Revision = {
  id: string;
  user: string | null;
  createdAt: number;
  status: string;
};

function emptyValue(field: Field): unknown {
  switch (field.type) {
    case "text":
    case "textarea":
    case "richtext":
    case "date":
      return "";
    case "number":
      return undefined;
    case "toggle":
      return false;
    case "select":
      return field.options[0]?.value ?? "";
    case "group":
      return Object.fromEntries(
        field.fields.map((child) => [child.name, emptyValue(child)]),
      );
    case "list":
      return [];
    case "image":
      return { alt: "", label: "", tone: "navy" };
    case "link":
      return { label: "", href: "" };
    case "seo":
      return {};
  }
}

function revisionTime(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

export function ListItemEditorForm({
  schema,
  itemId,
  initialValues,
  isPublished,
  mediaItems,
  pageLinks,
  revisions,
  notice,
}: {
  schema: PageSchema;
  itemId: string;
  initialValues?: Values;
  isPublished: boolean;
  mediaItems: readonly EditorMediaItem[];
  pageLinks: readonly { label: string; href: string }[];
  revisions: readonly Revision[];
  notice?: string;
}) {
  const [values, setValues] = useState<Values>(
    initialValues ??
      Object.fromEntries(
        schema.fields.map((field) => [field.name, emptyValue(field)]),
      ),
  );
  const [state, action, pending] = useActionState<ListActionState, FormData>(
    saveCollectionItemAction,
    {},
  );
  const isNew = itemId === "new";
  const slug = typeof values.slug === "string" ? values.slug : "";
  const viewHref = contentItemPath(schema.key, slug, values) ?? undefined;

  return (
    <div className="admin-page">
      <header className="admin-page-heading">
        <p className="admin-eyebrow">{schema.label}</p>
        <h1>{isNew ? `Add ${schema.label.toLowerCase()}` : "Edit entry"}</h1>
        <p>
          Add clear information. Save a draft to keep it private, or publish it
          to the website.
        </p>
      </header>
      {notice === "restored" ? (
        <p className="admin-message" role="status">
          Earlier details restored as a draft.
        </p>
      ) : null}
      {state.error ? (
        <p className="admin-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="admin-message" role="status">
          {state.message}
        </p>
      ) : null}
      <form action={action} className="admin-editor-form">
        <input name="collection" type="hidden" value={schema.key} />
        <input name="id" type="hidden" value={itemId} />
        <input name="fields" type="hidden" value={JSON.stringify(values)} />
        <FieldEditor
          fields={schema.fields}
          mediaItems={mediaItems}
          onChange={setValues}
          pageLinks={pageLinks}
          values={values}
        />
        <div className="admin-sticky-actions">
          <button
            className="admin-button"
            disabled={pending}
            name="intent"
            type="submit"
            value="draft"
          >
            Save draft
          </button>
          <button
            className="admin-button admin-button-primary"
            disabled={pending}
            name="intent"
            type="submit"
            value="publish"
          >
            Publish
          </button>
          {viewHref && !isNew && isPublished ? (
            <Link
              className="admin-button"
              href={viewHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              View on site
            </Link>
          ) : null}
          <Link className="admin-button" href={`/admin/${schema.key}`}>
            Back to {schema.label.toLowerCase()}
          </Link>
        </div>
      </form>

      {!isNew && revisions.length > 0 ? (
        <section
          aria-labelledby="list-history-heading"
          className="admin-section"
        >
          <h2 id="list-history-heading">Earlier versions</h2>
          <ul className="admin-recent-list">
            {revisions.map((revision) => (
              <li key={revision.id}>
                <span>
                  {revisionTime(revision.createdAt)}
                  {revision.user ? ` · ${revision.user}` : ""}
                  {` · ${revision.status}`}
                </span>
                <form action={restoreCollectionItemRevisionAction}>
                  <input name="collection" type="hidden" value={schema.key} />
                  <input name="id" type="hidden" value={itemId} />
                  <input name="revisionId" type="hidden" value={revision.id} />
                  <button className="admin-button" type="submit">
                    Restore as draft
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
