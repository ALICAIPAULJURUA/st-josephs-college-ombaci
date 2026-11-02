"use client";

import { useActionState, useState } from "react";

import { updateMediaAction, type MediaActionState } from "./actions";

type MediaItem = {
  id: string;
  url: string;
  alt: string;
  credit: string | null;
  licence: string | null;
  sourceUrl: string | null;
  isSample: boolean;
  hasPeople: boolean;
  consentRecorded: boolean;
};

const initialState: MediaActionState = {};

export function MediaCard({ item }: { item: MediaItem }) {
  const [state, action, pending] = useActionState(updateMediaAction, initialState);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function deletePhoto() {
    if (!window.confirm("Remove this photo from the library? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/admin/media/${item.id}`, {
        method: "DELETE",
      });
      const result: unknown = await response.json();
      if (
        !result ||
        typeof result !== "object" ||
        !("deleted" in result)
      ) {
        throw new Error("The server returned an unexpected delete response.");
      }
      if (!response.ok || result.deleted !== true) {
        const message =
          "error" in result && typeof result.error === "string"
            ? result.error
            : "We could not remove that photo.";
        setDeleteError(message);
        return;
      }
      window.location.reload();
    } catch (error) {
      console.error("Photo delete request failed.", error);
      setDeleteError("We could not remove that photo. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="admin-media-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="admin-media-preview" src={item.url} alt="" />
      <form action={action} className="admin-media-content admin-form">
        <input name="id" type="hidden" value={item.id} />
        <label className="admin-field">
          Alt text
          <input defaultValue={item.alt} maxLength={500} name="alt" required />
        </label>
        <label className="admin-field">
          Credit / photographer
          <input defaultValue={item.credit ?? ""} maxLength={300} name="credit" />
        </label>
        <label className="admin-field">
          Licence
          <input defaultValue={item.licence ?? ""} maxLength={300} name="licence" />
        </label>
        <label className="admin-field">
          Source URL
          <input
            defaultValue={item.sourceUrl ?? ""}
            maxLength={2048}
            name="sourceUrl"
            type="url"
          />
        </label>
        <div className="admin-media-badges">
          {item.isSample ? <span className="admin-badge">Sample</span> : null}
          {item.hasPeople ? (
            <span className="admin-badge admin-badge-muted">People shown</span>
          ) : null}
          {item.hasPeople && !item.consentRecorded && !item.isSample ? (
            <span className="admin-badge">Consent needed</span>
          ) : null}
        </div>
        <label className="admin-checkbox">
          <input
            defaultChecked={item.isSample}
            name="isSample"
            type="checkbox"
          />
          Sample photo
        </label>
        <label className="admin-checkbox">
          <input
            defaultChecked={item.hasPeople}
            name="hasPeople"
            type="checkbox"
          />
          Identifiable people appear
        </label>
        <label className="admin-checkbox">
          <input
            defaultChecked={item.consentRecorded}
            name="consentRecorded"
            type="checkbox"
          />
          Permission to publish recorded
        </label>
        <div className="admin-media-actions">
          <button className="admin-button admin-button-primary" disabled={pending}>
            {pending ? "Saving..." : "Save details"}
          </button>
          <button
            className="admin-button admin-delete"
            disabled={deleting}
            onClick={deletePhoto}
            type="button"
          >
            {deleting ? "Removing..." : "Remove"}
          </button>
        </div>
        <p
          className={`admin-status${state.error || deleteError ? " admin-status-error" : ""}`}
          aria-live="polite"
        >
          {state.error ?? state.message ?? deleteError}
        </p>
      </form>
    </article>
  );
}
