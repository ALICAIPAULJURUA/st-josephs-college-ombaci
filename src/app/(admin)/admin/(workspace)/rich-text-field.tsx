"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Editor as TinyMCEEditor, TinyMCE } from "tinymce";

import type { EditorMediaItem } from "./media-picker";
import { MediaPickerDialog } from "./media-picker";

const TinyEditor = dynamic(
  async () => {
    const editorModule = await import("@tinymce/tinymce-react");
    return editorModule.Editor;
  },
  { ssr: false },
);

type PageLink = {
  label: string;
  href: string;
};

type LinkDraft = {
  text: string;
  type: "page" | "web";
  href: string;
  openNewTab: boolean;
  error?: string;
};

type FilePicker = NonNullable<
  Parameters<TinyMCE["init"]>[0]["file_picker_callback"]
>;

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function sanitizePastedHtml(html: string) {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const allowedTags = new Set([
    "P",
    "BR",
    "H2",
    "H3",
    "UL",
    "OL",
    "LI",
    "STRONG",
    "EM",
    "A",
    "BLOCKQUOTE",
  ]);
  const forbiddenContentTags = new Set(["SCRIPT", "STYLE", "IFRAME"]);

  for (const element of Array.from(parsed.body.querySelectorAll("*"))) {
    if (!allowedTags.has(element.tagName)) {
      if (forbiddenContentTags.has(element.tagName)) element.remove();
      else element.replaceWith(...Array.from(element.childNodes));
      continue;
    }

    const allowedAttributes =
      element.tagName === "A" ? new Set(["href", "target", "rel"]) : new Set();
    for (const attribute of Array.from(element.attributes)) {
      if (!allowedAttributes.has(attribute.name)) {
        element.removeAttribute(attribute.name);
      }
    }
    if (element.tagName !== "A") continue;

    const href = element.getAttribute("href");
    if (!href) continue;
    try {
      const url = new URL(href, window.location.origin);
      if (!["http:", "https:", "mailto:", "tel:"].includes(url.protocol)) {
        element.removeAttribute("href");
        element.removeAttribute("target");
        element.removeAttribute("rel");
      } else if (
        (url.protocol === "http:" || url.protocol === "https:") &&
        url.origin !== window.location.origin
      ) {
        element.setAttribute("rel", "noopener noreferrer");
      }
    } catch {
      element.removeAttribute("href");
      element.removeAttribute("target");
      element.removeAttribute("rel");
    }
  }

  return parsed.body.innerHTML;
}

export function RichTextField({
  value,
  onChange,
  mediaItems,
  pages = [{ label: "Home page", href: "/" }],
}: {
  value: string;
  onChange: (value: string) => void;
  mediaItems: readonly EditorMediaItem[];
  pages?: readonly PageLink[];
}) {
  const [imagePicker, setImagePicker] = useState<
    ((item: EditorMediaItem) => void) | null
  >(null);
  const [linkDraft, setLinkDraft] = useState<LinkDraft | null>(null);
  const editorRef = useRef<TinyMCEEditor | null>(null);

  const filePickerCallback: FilePicker = (callback, _value, meta) => {
    if (meta.filetype !== "image") return;
    setImagePicker(
      () => (item: EditorMediaItem) =>
        callback(item.url, { alt: item.alt, title: item.alt }),
    );
  };

  return (
    <div className="admin-rich-text">
      <div className="admin-rich-text-heading">
        <span>Text editor</span>
        <details className="admin-rich-text-help">
          <summary>Help</summary>
          <ul>
            <li>Use Format to choose a paragraph or a section heading.</li>
            <li>Use the list buttons for steps or bullet points.</li>
            <li>Select words before adding a link or changing their style.</li>
            <li>Choose Image to add a photo from the school photo library.</li>
            <li>Use Clear formatting to remove styling from selected text.</li>
          </ul>
        </details>
      </div>
      <TinyEditor
        init={{
          base_url: "/tinymce",
          suffix: ".min",
          menubar: false,
          statusbar: false,
          resize: false,
          branding: false,
          promotion: false,
          height: 360,
          toolbar_mode: "wrap",
          toolbar:
            "undo redo | blocks | bold italic | bullist numlist | siteLink | siteImage | table | siteQuote | removeformat",
          plugins: "image link lists table",
          block_formats: "Paragraph=p; Heading 2=h2; Heading 3=h3",
          paste_as_text: true,
          paste_data_images: false,
          valid_elements:
            "p,br,h2,h3,ul,ol,li,strong,em,a[href|target|rel],blockquote,table,thead,tbody,tr,th,td,img[src|alt|width|height],figure,figcaption",
          content_style:
            "body { font-family: Barlow, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #1a1a1a; } h2, h3 { color: #0a2352; }",
          file_picker_types: "image",
          file_picker_callback: filePickerCallback,
          setup(editor) {
            editorRef.current = editor;
            editor.ui.registry.addButton("siteLink", {
              text: "Link",
              tooltip: "Add a link",
              onAction() {
                const text = editor.selection.getContent({ format: "text" });
                setLinkDraft({
                  text,
                  type: "page",
                  href: pages[0]?.href ?? "",
                  openNewTab: false,
                });
              },
            });
            editor.ui.registry.addButton("siteImage", {
              text: "Image",
              tooltip: "Choose a photo",
              onAction() {
                filePickerCallback(
                  (url, meta) => {
                    const alt = typeof meta?.alt === "string" ? meta.alt : "";
                    editor.insertContent(
                      `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(alt)}">`,
                    );
                  },
                  "",
                  { filetype: "image" },
                );
              },
            });
            editor.ui.registry.addButton("siteQuote", {
              text: "Quote",
              tooltip: "Format as a quote",
              onAction() {
                editor.execCommand("mceBlockQuote");
              },
            });
            editor.on("Paste", (event) => {
              const clipboardEvent = event as ClipboardEvent;
              const html = clipboardEvent.clipboardData?.getData("text/html");
              if (!html) return;
              clipboardEvent.preventDefault();
              editor.insertContent(sanitizePastedHtml(html));
            });
          },
        }}
        licenseKey="gpl"
        onEditorChange={onChange}
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        value={value}
      />
      {imagePicker ? (
        <MediaPickerDialog
          items={mediaItems}
          onChoose={(item) => {
            imagePicker(item);
            setImagePicker(null);
          }}
          onClose={() => setImagePicker(null)}
        />
      ) : null}
      {linkDraft ? (
        <LinkDialog
          draft={linkDraft}
          pages={pages}
          onChange={setLinkDraft}
          onClose={() => setLinkDraft(null)}
          onSubmit={(draft) => {
            const editor = editorRef.current;
            if (!editor) return;
            const linkText = escapeAttribute(draft.text.trim());
            const href = escapeAttribute(draft.href.trim());
            let attributes = `href="${href}"`;
            if (draft.type === "web") {
              attributes += ' rel="noopener noreferrer"';
              if (draft.openNewTab) attributes += ' target="_blank"';
            }
            editor.insertContent(`<a ${attributes}>${linkText}</a>`);
            setLinkDraft(null);
          }}
        />
      ) : null}
    </div>
  );
}

function LinkDialog({
  draft,
  pages,
  onChange,
  onClose,
  onSubmit,
}: {
  draft: LinkDraft;
  pages: readonly PageLink[];
  onChange: (draft: LinkDraft) => void;
  onClose: () => void;
  onSubmit: (draft: LinkDraft) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const currentDialog = dialog.current;
    currentDialog?.showModal();
    return () => {
      if (currentDialog?.open) currentDialog.close();
    };
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.text.trim() || !draft.href.trim()) {
      onChange({ ...draft, error: "Add the link text and address." });
      return;
    }
    if (draft.type === "web") {
      try {
        const url = new URL(draft.href);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          onChange({
            ...draft,
            error: "Use a web address that begins with http:// or https://.",
          });
          return;
        }
      } catch {
        onChange({
          ...draft,
          error: "Enter a full web address, including https://.",
        });
        return;
      }
    }
    onSubmit(draft);
  };

  return (
    <dialog
      aria-labelledby="rich-link-title"
      className="admin-picker-dialog admin-link-dialog"
      onClose={onClose}
      ref={dialog}
    >
      <div className="admin-picker-heading">
        <h2 id="rich-link-title">Add a link</h2>
        <button className="admin-button" onClick={onClose} type="button">
          Close
        </button>
      </div>
      <form className="admin-form" onSubmit={submit}>
        <label className="admin-field">
          Link text
          <input
            autoFocus
            onChange={(event) =>
              onChange({ ...draft, text: event.target.value, error: undefined })
            }
            value={draft.text}
          />
        </label>
        <fieldset className="admin-link-type">
          <legend>Where should it go?</legend>
          <label>
            <input
              checked={draft.type === "page"}
              name="link-type"
              onChange={() =>
                onChange({
                  ...draft,
                  type: "page",
                  href: pages[0]?.href ?? "",
                  error: undefined,
                })
              }
              type="radio"
            />
            A page on this site
          </label>
          <label>
            <input
              checked={draft.type === "web"}
              name="link-type"
              onChange={() =>
                onChange({ ...draft, type: "web", href: "", error: undefined })
              }
              type="radio"
            />
            A web address
          </label>
        </fieldset>
        {draft.type === "page" ? (
          <label className="admin-field">
            Choose a page
            <select
              onChange={(event) =>
                onChange({
                  ...draft,
                  href: event.target.value,
                  error: undefined,
                })
              }
              value={draft.href}
            >
              {pages.map((page) => (
                <option key={page.href} value={page.href}>
                  {page.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <label className="admin-field">
              Web address
              <input
                onChange={(event) =>
                  onChange({
                    ...draft,
                    href: event.target.value,
                    error: undefined,
                  })
                }
                placeholder="https://example.com"
                type="url"
                value={draft.href}
              />
            </label>
            <label className="admin-inline-checkbox">
              <input
                checked={draft.openNewTab}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    openNewTab: event.target.checked,
                    error: undefined,
                  })
                }
                type="checkbox"
              />
              Open in a new tab
            </label>
          </>
        )}
        {draft.error ? (
          <p aria-live="polite" className="admin-alert">
            {draft.error}
          </p>
        ) : null}
        <button className="admin-button admin-button-primary" type="submit">
          Add link
        </button>
      </form>
    </dialog>
  );
}
