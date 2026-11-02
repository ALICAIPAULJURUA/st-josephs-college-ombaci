"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { Field, PageSchema } from "@/content/schemas";

import {
  savePageContentAction,
  restorePageRevisionAction,
  type ContentActionState,
} from "./content-actions";
import { FieldEditor } from "./field-editor";
import type { EditorMediaItem } from "./media-picker";

type Values = Record<string, unknown>;
type PageLink = { label: string; href: string };
type Revision = {
  id: string;
  user: string | null;
  createdAt: number;
  status: string;
  changes: { label: string; before: string; after: string }[];
};

function isRecord(value: unknown): value is Values {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function revisionDate(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

function previewText(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "boolean") return value ? "On" : "Off";
  return "";
}

function PreviewFields({
  fields,
  values,
}: {
  fields: readonly Field[];
  values: Values;
}) {
  return (
    <dl className="admin-preview-fields">
      {fields.map((field) => {
        const value = values[field.name];
        if (field.type === "group" && isRecord(value)) {
          return (
            <div className="admin-preview-group" key={field.name}>
              <dt>{field.label}</dt>
              <dd>
                <PreviewFields fields={field.fields} values={value} />
              </dd>
            </div>
          );
        }
        if (field.type === "list" && Array.isArray(value)) {
          return (
            <div className="admin-preview-group" key={field.name}>
              <dt>{field.label}</dt>
              <dd>
                {value.length > 0 ? (
                  <ol>
                    {value.map((entry, index) => (
                      <li key={`${field.name}-${index}`}>
                        {"itemFields" in field && isRecord(entry) ? (
                          <PreviewFields
                            fields={field.itemFields}
                            values={entry}
                          />
                        ) : (
                          previewText(entry) || "Empty"
                        )}
                      </li>
                    ))}
                  </ol>
                ) : (
                  "No entries"
                )}
              </dd>
            </div>
          );
        }
        if (field.type === "richtext" && typeof value === "string") {
          return (
            <div className="admin-preview-group" key={field.name}>
              <dt>{field.label}</dt>
              <dd>{value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")}</dd>
            </div>
          );
        }
        if (field.type === "image" && isRecord(value)) {
          return (
            <div className="admin-preview-group" key={field.name}>
              <dt>{field.label}</dt>
              <dd>
                {typeof value.src === "string" && value.src ? (
                  <Image
                    alt={typeof value.alt === "string" ? value.alt : ""}
                    className="admin-preview-image"
                    height={260}
                    unoptimized
                    src={value.src}
                    width={420}
                  />
                ) : (
                  previewText(value.label) || "No photo selected"
                )}
              </dd>
            </div>
          );
        }
        if (field.type === "link" && isRecord(value)) {
          return (
            <div className="admin-preview-group" key={field.name}>
              <dt>{field.label}</dt>
              <dd>
                {previewText(value.label)} - {previewText(value.href)}
              </dd>
            </div>
          );
        }
        if (field.type === "seo" && isRecord(value)) {
          return (
            <div className="admin-preview-group" key={field.name}>
              <dt>{field.label}</dt>
              <dd>
                {previewText(value.title)}
                {value.title && value.description ? " - " : ""}
                {previewText(value.description)}
              </dd>
            </div>
          );
        }
        return (
          <div className="admin-preview-group" key={field.name}>
            <dt>{field.label}</dt>
            <dd>{previewText(value) || "Empty"}</dd>
          </div>
        );
      })}
    </dl>
  );
}

function PreviewDialog({
  schema,
  values,
  onClose,
}: {
  schema: PageSchema;
  values: Values;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const currentDialog = dialog.current;
    currentDialog?.showModal();
    return () => {
      if (currentDialog?.open) currentDialog.close();
    };
  }, []);

  return (
    <dialog
      aria-labelledby="page-preview-title"
      className="admin-picker-dialog admin-preview-dialog"
      onClose={onClose}
      ref={dialog}
    >
      <div className="admin-picker-heading">
        <div>
          <p className="admin-eyebrow">Preview</p>
          <h2 id="page-preview-title">{schema.label}</h2>
        </div>
        <button className="admin-button" onClick={onClose} type="button">
          Close
        </button>
      </div>
      <p className="admin-muted">
        This preview shows the current fields. The public page layout is
        available from &quot;View on site&quot;.
      </p>
      <PreviewFields fields={schema.fields} values={values} />
    </dialog>
  );
}

export function PageEditorForm({
  schema,
  initialValues,
  mediaItems,
  pageLinks,
  isPublished,
  status,
  lastEditedBy,
  lastEditedAt,
  revisions,
  notice,
}: {
  schema: PageSchema;
  initialValues: Values;
  mediaItems: readonly EditorMediaItem[];
  pageLinks: readonly PageLink[];
  isPublished: boolean;
  status: string;
  lastEditedBy?: string;
  lastEditedAt?: number;
  revisions: readonly Revision[];
  notice?: string;
}) {
  const [values, setValues] = useState(initialValues);
  const [dirty, setDirty] = useState(false);
  const [autosaveAvailable, setAutosaveAvailable] = useState(false);
  const [autosaveError, setAutosaveError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [state, action, pending] = useActionState<ContentActionState, FormData>(
    savePageContentAction,
    {},
  );
  const dirtyRef = useRef(false);
  const valuesRef = useRef(values);
  const submittedSnapshot = useRef<string | null>(null);
  const autosaveKey = `ombaci-editor-${schema.key}`;

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(autosaveKey);
      if (!saved) return;
      const parsed: unknown = JSON.parse(saved);
      if (
        isRecord(parsed) &&
        parsed.key === schema.key &&
        isRecord(parsed.values) &&
        typeof parsed.savedAt === "number"
      ) {
        const timer = window.setTimeout(() => setAutosaveAvailable(true), 0);
        return () => window.clearTimeout(timer);
      }
    } catch {
      const timer = window.setTimeout(
        () =>
          setAutosaveError(
            "Your browser could not read the saved local draft. The page changes are still available.",
          ),
        0,
      );
      return () => window.clearTimeout(timer);
    }
  }, [autosaveKey, schema.key]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!dirtyRef.current) return;
      try {
        localStorage.setItem(
          autosaveKey,
          JSON.stringify({
            key: schema.key,
            values: valuesRef.current,
            savedAt: Date.now(),
          }),
        );
        setAutosaveError("");
      } catch {
        setAutosaveError(
          "Your browser could not save a local draft. Use Save draft to keep your changes.",
        );
      }
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [autosaveKey, schema.key]);

  useEffect(() => {
    if (!dirty) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const confirmNavigation = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (
        !link ||
        link.getAttribute("target") === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }
      const destination = new URL(
        link.getAttribute("href") ?? "",
        window.location.href,
      );
      if (
        destination.origin !== window.location.origin ||
        destination.href === window.location.href
      ) {
        return;
      }
      if (!window.confirm("You have unsaved changes. Leave this page?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const confirmOtherFormSubmit = (event: SubmitEvent) => {
      if (!(event.target instanceof HTMLFormElement)) return;
      if (event.target.id === "page-editor-form") return;
      if (!window.confirm("You have unsaved changes. Leave this page?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    document.addEventListener("click", confirmNavigation, true);
    document.addEventListener("submit", confirmOtherFormSubmit, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeaving);
      document.removeEventListener("click", confirmNavigation, true);
      document.removeEventListener("submit", confirmOtherFormSubmit, true);
    };
  }, [dirty]);

  useEffect(() => {
    if (!state.message || !state.operationId) return;
    if (submittedSnapshot.current !== JSON.stringify(valuesRef.current)) return;
    const timer = window.setTimeout(() => {
      setDirty(false);
      dirtyRef.current = false;
      try {
        localStorage.removeItem(autosaveKey);
        setAutosaveAvailable(false);
        setAutosaveError("");
      } catch {
        setAutosaveError(
          "Your saved browser draft could not be cleared. The server copy was saved.",
        );
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [autosaveKey, state.message, state.operationId]);

  const restoreAutosave = () => {
    try {
      const saved = localStorage.getItem(autosaveKey);
      const parsed: unknown = saved ? JSON.parse(saved) : null;
      if (!isRecord(parsed) || !isRecord(parsed.values)) {
        setAutosaveAvailable(false);
        setAutosaveError("The saved browser draft could not be restored.");
        return;
      }
      setValues(parsed.values);
      setDirty(true);
      dirtyRef.current = true;
      setAutosaveAvailable(false);
    } catch {
      setAutosaveError("The saved browser draft could not be restored.");
    }
  };

  const discardAutosave = () => {
    try {
      localStorage.removeItem(autosaveKey);
      setAutosaveAvailable(false);
      setAutosaveError("");
    } catch {
      setAutosaveError("The saved browser draft could not be removed.");
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-heading">
        <p className="admin-eyebrow">{schema.label}</p>
        <h1>Edit {schema.label.toLowerCase()}</h1>
        <p>
          {isPublished
            ? "Changes saved as a draft do not change the live page."
            : "Save your work as a draft, or publish it when it is ready."}
        </p>
      </header>

      <div aria-live="polite" className="admin-editor-sticky">
        <div className="admin-editor-sticky-status">
          <strong>
            {isPublished
              ? "Published"
              : status === "hidden"
                ? "Not published"
                : "Draft"}
          </strong>
          {dirty ? <span>Unsaved changes</span> : null}
          {lastEditedAt ? (
            <span>
              Last edited
              {lastEditedBy ? ` by ${lastEditedBy}` : ""} on{" "}
              {revisionDate(lastEditedAt)}
            </span>
          ) : null}
        </div>
        <div className="admin-editor-sticky-actions">
          <button
            className="admin-button"
            disabled={pending}
            form="page-editor-form"
            name="intent"
            type="submit"
            value="draft"
          >
            Save draft
          </button>
          <button
            className="admin-button admin-button-primary"
            disabled={pending}
            form="page-editor-form"
            name="intent"
            type="submit"
            value="publish"
          >
            {pending ? "Saving..." : "Publish"}
          </button>
          <a
            className="admin-button"
            href={schema.key === "settings" ? "/" : schema.route}
            rel="noopener noreferrer"
            target="_blank"
          >
            View on site
          </a>
          <button
            className="admin-button"
            onClick={() => setPreviewOpen(true)}
            type="button"
          >
            Preview
          </button>
        </div>
      </div>

      {notice ? <p className="admin-status">{notice}</p> : null}
      {autosaveAvailable ? (
        <div className="admin-autosave-notice">
          <p>A browser draft is available from your last editing session.</p>
          <button
            className="admin-button"
            onClick={restoreAutosave}
            type="button"
          >
            Restore browser draft
          </button>
          <button
            className="admin-button"
            onClick={discardAutosave}
            type="button"
          >
            Discard browser draft
          </button>
        </div>
      ) : null}
      {autosaveError ? (
        <p aria-live="polite" className="admin-status admin-status-error">
          {autosaveError}
        </p>
      ) : null}

      <form
        action={action}
        className="admin-editor-form"
        id="page-editor-form"
        onResetCapture={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onSubmit={() => {
          submittedSnapshot.current = JSON.stringify(valuesRef.current);
        }}
      >
        <input name="key" type="hidden" value={schema.key} />
        <input name="fields" type="hidden" value={JSON.stringify(values)} />
        <FieldEditor
          fields={schema.fields}
          mediaItems={mediaItems}
          onChange={(next) => {
            setValues(next);
            setDirty(true);
            dirtyRef.current = true;
          }}
          pageLinks={pageLinks}
          values={values}
        />
      </form>

      <p
        aria-live="polite"
        className={`admin-status${state.error ? " admin-status-error" : ""}`}
      >
        {state.error ?? state.message}
      </p>

      <section
        aria-labelledby="version-history-heading"
        className="admin-section"
      >
        <div className="admin-section-heading">
          <h2 id="version-history-heading">Earlier versions</h2>
        </div>
        {revisions.length > 0 ? (
          <ol className="admin-revision-list">
            {revisions.map((revision) => (
              <li className="admin-revision-item" key={revision.id}>
                <details>
                  <summary>
                    <span>{revisionDate(revision.createdAt)}</span>
                    <span>{revision.user ?? "School office"}</span>
                    <span>
                      {revision.status === "publish" ? "Published" : "Draft"}
                    </span>
                  </summary>
                  {revision.changes.length > 0 ? (
                    <ul className="admin-revision-changes">
                      {revision.changes.map((change) => (
                        <li key={change.label}>
                          <strong>{change.label}</strong>
                          <span>
                            {change.before} -&gt; {change.after}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="admin-muted">
                      This version has no field changes compared with the
                      current editing copy.
                    </p>
                  )}
                  <form action={restorePageRevisionAction}>
                    <input name="key" type="hidden" value={schema.key} />
                    <input
                      name="revisionId"
                      type="hidden"
                      value={revision.id}
                    />
                    <button className="admin-button" type="submit">
                      Restore this version
                    </button>
                  </form>
                </details>
              </li>
            ))}
          </ol>
        ) : (
          <div className="admin-panel admin-empty">
            <p>Saved versions will appear here after your first save.</p>
          </div>
        )}
      </section>

      {previewOpen ? (
        <PreviewDialog
          onClose={() => setPreviewOpen(false)}
          schema={schema}
          values={values}
        />
      ) : null}
    </div>
  );
}
