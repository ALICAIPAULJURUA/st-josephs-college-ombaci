"use client";

import { useId, useState } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";

import type {
  Field,
  GroupField,
  ImagePhoto,
  ListField,
} from "@/content/schemas";

import type { EditorMediaItem } from "./media-picker";
import { MediaPickerDialog } from "./media-picker";
import { RichTextField } from "./rich-text-field";

type Values = Record<string, unknown>;

function isRecord(value: unknown): value is Values {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function labelWithRequired(label: string, required?: boolean) {
  return (
    <>
      {label}
      {required ? <span className="admin-required">Required</span> : null}
    </>
  );
}

function fieldValueForAdd(field: Field): unknown {
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
      return field.options[0]?.value;
    case "group":
      return Object.fromEntries(
        field.fields.map((child) => [child.name, fieldValueForAdd(child)]),
      );
    case "list":
      return [];
    case "image":
      return { alt: "", label: "", tone: "navy" } satisfies ImagePhoto;
    case "link":
      return { label: "", href: "" };
    case "seo":
      return {};
  }
}

function fieldListValue(field: ListField, value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function reorder(values: readonly unknown[], from: number, to: number) {
  if (to < 0 || to >= values.length || from === to) return values;
  const next = [...values];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function Hint({ children, id }: { children: string; id?: string }) {
  return (
    <span className="admin-field-hint" id={id}>
      {children}
    </span>
  );
}

function CharacterCounter({
  value,
  max,
}: {
  value: string;
  max: number | undefined;
}) {
  if (max === undefined) return null;
  return (
    <span aria-live="polite" className="admin-character-count">
      {value.length} / {max}
    </span>
  );
}

export function FieldEditor({
  fields,
  values,
  onChange,
  mediaItems,
  pageLinks,
}: {
  fields: readonly Field[];
  values: Values;
  onChange: (next: Values) => void;
  mediaItems: readonly EditorMediaItem[];
  pageLinks: readonly { label: string; href: string }[];
}) {
  return (
    <div className="admin-editor-fields">
      {fields.map((field) => (
        <FieldControl
          field={field}
          key={field.name}
          mediaItems={mediaItems}
          onChange={(value) => onChange({ ...values, [field.name]: value })}
          pageLinks={pageLinks}
          value={values[field.name]}
        />
      ))}
    </div>
  );
}

function FieldControl({
  field,
  value,
  onChange,
  mediaItems,
  pageLinks,
}: {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  mediaItems: readonly EditorMediaItem[];
  pageLinks: readonly { label: string; href: string }[];
}) {
  const labelId = useId();
  const hintId = useId();

  if (field.type === "group") {
    const groupField: GroupField = field;
    const nested = isRecord(value) ? value : {};
    return (
      <fieldset className="admin-editor-group">
        <legend>{labelWithRequired(field.label, field.required)}</legend>
        <Hint>{field.hint}</Hint>
        <FieldEditor
          fields={groupField.fields}
          mediaItems={mediaItems}
          onChange={onChange}
          pageLinks={pageLinks}
          values={nested}
        />
      </fieldset>
    );
  }

  if (field.type === "list") {
    const listField: ListField = field;
    const entries = fieldListValue(listField, value);
    const updateEntries = (next: readonly unknown[]) => onChange([...next]);
    return (
      <fieldset className="admin-editor-list">
        <legend>{labelWithRequired(field.label, field.required)}</legend>
        <Hint>{field.hint}</Hint>
        <div className="admin-editor-list-items">
          {entries.map((entry, index) => (
            <div
              className="admin-editor-list-item"
              draggable
              key={`${field.name}-${index}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const from = Number(event.dataTransfer.getData("text/plain"));
                if (Number.isInteger(from))
                  updateEntries(reorder(entries, from, index));
              }}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(index));
              }}
            >
              <div className="admin-editor-item-heading">
                <strong>
                  {field.label} {index + 1}
                </strong>
                <div className="admin-editor-item-controls">
                  <button
                    aria-label={`Move ${field.label} ${index + 1} up`}
                    className="admin-button"
                    disabled={index === 0}
                    onClick={() =>
                      updateEntries(reorder(entries, index, index - 1))
                    }
                    type="button"
                  >
                    Up
                  </button>
                  <button
                    aria-label={`Move ${field.label} ${index + 1} down`}
                    className="admin-button"
                    disabled={index === entries.length - 1}
                    onClick={() =>
                      updateEntries(reorder(entries, index, index + 1))
                    }
                    type="button"
                  >
                    Down
                  </button>
                  <button
                    aria-label={`Remove ${field.label} ${index + 1}`}
                    className="admin-button"
                    onClick={() =>
                      updateEntries(
                        entries.filter((_, entryIndex) => entryIndex !== index),
                      )
                    }
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {"itemFields" in field ? (
                <FieldEditor
                  fields={field.itemFields}
                  mediaItems={mediaItems}
                  pageLinks={pageLinks}
                  onChange={(next) =>
                    updateEntries(
                      entries.map((item, entryIndex) =>
                        entryIndex === index ? next : item,
                      ),
                    )
                  }
                  values={isRecord(entry) ? entry : {}}
                />
              ) : (
                <label className="admin-field">
                  {labelWithRequired(field.label, field.required)}
                  <input
                    maxLength={field.max}
                    onChange={(event) =>
                      updateEntries(
                        entries.map((item, entryIndex) =>
                          entryIndex === index ? event.target.value : item,
                        ),
                      )
                    }
                    value={typeof entry === "string" ? entry : ""}
                  />
                  <CharacterCounter
                    max={field.max}
                    value={typeof entry === "string" ? entry : ""}
                  />
                </label>
              )}
            </div>
          ))}
        </div>
        <button
          className="admin-button"
          onClick={() =>
            updateEntries([
              ...entries,
              "itemFields" in field
                ? Object.fromEntries(
                    field.itemFields.map((child) => [
                      child.name,
                      fieldValueForAdd(child),
                    ]),
                  )
                : "",
            ])
          }
          type="button"
        >
          Add {field.label.toLowerCase().replace(/s$/, "")}
        </button>
      </fieldset>
    );
  }

  if (field.type === "richtext") {
    return (
      <div className="admin-editor-richtext">
        <label className="admin-field">
          {labelWithRequired(field.label, field.required)}
          <Hint>{field.hint}</Hint>
          <RichTextField
            mediaItems={mediaItems}
            onChange={(next) => onChange(next)}
            pages={pageLinks}
            value={typeof value === "string" ? value : ""}
          />
        </label>
      </div>
    );
  }

  if (field.type === "image") {
    const photo = isRecord(value) ? value : {};
    return (
      <fieldset className="admin-editor-image">
        <legend>{labelWithRequired(field.label, field.required)}</legend>
        <Hint>{field.hint}</Hint>
        {typeof photo.src === "string" && photo.src ? (
          <Image
            alt={typeof photo.alt === "string" ? photo.alt : ""}
            className="admin-editor-image-preview"
            height={220}
            unoptimized
            src={photo.src}
            width={360}
          />
        ) : null}
        <ImageValueEditor
          mediaItems={mediaItems}
          onChange={onChange}
          value={photo}
        />
      </fieldset>
    );
  }

  if (field.type === "link") {
    const link = isRecord(value) ? value : {};
    return (
      <fieldset className="admin-editor-group">
        <legend>{labelWithRequired(field.label, field.required)}</legend>
        <Hint>{field.hint}</Hint>
        <label className="admin-field">
          Link label
          <input
            onChange={(event) =>
              onChange({ ...link, label: event.target.value })
            }
            value={typeof link.label === "string" ? link.label : ""}
          />
        </label>
        <label className="admin-field">
          Link address
          <input
            onChange={(event) =>
              onChange({ ...link, href: event.target.value })
            }
            value={typeof link.href === "string" ? link.href : ""}
          />
        </label>
      </fieldset>
    );
  }

  if (field.type === "seo") {
    const seo = isRecord(value) ? value : {};
    const seoFields = [
      { key: "title", label: "Search title", max: 70 },
      { key: "description", label: "Search description", max: 160 },
    ] as const;
    return (
      <fieldset className="admin-editor-group">
        <legend>{labelWithRequired(field.label, field.required)}</legend>
        <Hint>{field.hint}</Hint>
        {seoFields.map(({ key, label, max }) => {
          const current = typeof seo[key] === "string" ? seo[key] : "";
          return (
            <label className="admin-field" key={key}>
              {label}
              {key === "description" ? (
                <textarea
                  maxLength={max}
                  onChange={(event) =>
                    onChange({ ...seo, [key]: event.target.value })
                  }
                  value={current}
                />
              ) : (
                <input
                  maxLength={max}
                  onChange={(event) =>
                    onChange({ ...seo, [key]: event.target.value })
                  }
                  value={current}
                />
              )}
              <CharacterCounter max={max} value={current} />
            </label>
          );
        })}
      </fieldset>
    );
  }

  if (field.type === "toggle") {
    return (
      <fieldset className="admin-editor-toggle">
        <legend>{labelWithRequired(field.label, field.required)}</legend>
        <Hint>{field.hint}</Hint>
        <label>
          <input
            checked={value === true}
            onChange={(event) => onChange(event.target.checked)}
            type="checkbox"
          />
          {field.label}
        </label>
      </fieldset>
    );
  }

  if (field.type === "select") {
    return (
      <label className="admin-field">
        <span id={labelId}>
          {labelWithRequired(field.label, field.required)}
        </span>
        <Hint id={hintId}>{field.hint}</Hint>
        <select
          aria-describedby={hintId}
          aria-labelledby={labelId}
          onChange={(event) => onChange(event.target.value || undefined)}
          value={typeof value === "string" ? value : ""}
        >
          {!field.required ? (
            <option value="">Choose if applicable</option>
          ) : null}
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "number") {
    return (
      <label className="admin-field">
        <span id={labelId}>
          {labelWithRequired(field.label, field.required)}
        </span>
        <Hint id={hintId}>{field.hint}</Hint>
        <input
          aria-describedby={hintId}
          aria-labelledby={labelId}
          max={field.max}
          min={field.min}
          onChange={(event) =>
            onChange(
              event.target.value === ""
                ? undefined
                : Number(event.target.value),
            )
          }
          type="number"
          value={typeof value === "number" ? value : ""}
        />
      </label>
    );
  }

  const current = typeof value === "string" ? value : "";
  const sharedProps = {
    "aria-describedby": hintId,
    "aria-labelledby": labelId,
    maxLength: "max" in field ? field.max : undefined,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
    value: current,
  };
  return (
    <label className="admin-field">
      <span id={labelId}>
        {labelWithRequired(field.label, field.required)}
      </span>
      <Hint id={hintId}>{field.hint}</Hint>
      {field.type === "textarea" || field.type === "date" ? (
        field.type === "date" ? (
          <input {...sharedProps} type="date" />
        ) : (
          <textarea {...sharedProps} />
        )
      ) : (
        <input {...sharedProps} />
      )}
      {"max" in field ? (
        <CharacterCounter max={field.max} value={current} />
      ) : null}
    </label>
  );
}

function ImageValueEditor({
  value,
  onChange,
  mediaItems,
}: {
  value: Values;
  onChange: (value: unknown) => void;
  mediaItems: readonly EditorMediaItem[];
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const alt = typeof value.alt === "string" ? value.alt : "";
  const label = typeof value.label === "string" ? value.label : "";
  const tone = typeof value.tone === "string" ? value.tone : "navy";
  const ratio = typeof value.ratio === "string" ? value.ratio : "";

  return (
    <div className="admin-image-editor">
      <button
        className="admin-button"
        onClick={() => setPickerOpen(true)}
        type="button"
      >
        Choose a photo
      </button>
      <label className="admin-field">
        Photo description <span className="admin-required">Required</span>
        <Hint>Describe the photo for visitors who cannot see it.</Hint>
        <input
          onChange={(event) => {
            onChange({ ...value, alt: event.target.value });
          }}
          value={alt}
        />
      </label>
      <label className="admin-field">
        Placeholder label <span className="admin-required">Required</span>
        <Hint>Shown when no photo has been chosen.</Hint>
        <input
          onChange={(event) => {
            onChange({ ...value, label: event.target.value });
          }}
          value={label}
        />
      </label>
      <div className="admin-upload-grid">
        <label className="admin-field">
          Placeholder colour <span className="admin-required">Required</span>
          <Hint>Choose an approved placeholder colour.</Hint>
          <select
            onChange={(event) => {
              onChange({ ...value, tone: event.target.value });
            }}
            value={tone}
          >
            {["navy", "navy-2", "green", "tint", "mist", "white"].map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="admin-field">
          Photo shape
          <Hint>Choose the shape used for the photo.</Hint>
          <select
            onChange={(event) => {
              onChange({
                ...value,
                ratio: event.target.value || undefined,
              });
            }}
            value={ratio}
          >
            <option value="">Use the page layout</option>
            {["4/3", "3/4", "16/9", "1/1", "3/2", "4/5"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      {pickerOpen ? (
        <MediaPickerDialog
          items={mediaItems}
          onChoose={(item) => {
            onChange({
              ...value,
              src: item.url,
              alt: item.alt,
              label,
              tone,
              ...(ratio ? { ratio } : {}),
            });
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  );
}
