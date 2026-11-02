"use client";

import { useState, type FormEvent } from "react";

type UploadStatus = {
  message: string;
  error: boolean;
};

export function MediaUploadForm() {
  const [status, setStatus] = useState<UploadStatus | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: new FormData(form),
      });
      const result: unknown = await response.json();
      if (
        !result ||
        typeof result !== "object" ||
        !("error" in result || "id" in result)
      ) {
        throw new Error("The server returned an unexpected upload response.");
      }
      if (!response.ok) {
        const message =
          "error" in result && typeof result.error === "string"
            ? result.error
            : "We could not upload that photo.";
        setStatus({ message, error: true });
        return;
      }

      form.reset();
      setStatus({ message: "Photo uploaded.", error: false });
      window.location.reload();
    } catch (error) {
      console.error("Photo upload request failed.", error);
      setStatus({
        message: "We could not upload that photo. Check your connection and try again.",
        error: true,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-form admin-form-card admin-upload-card" onSubmit={submit}>
      <h2>Upload a photo</h2>
      <div className="admin-upload-grid">
        <label className="admin-field">
          Photo file
          <input
            accept="image/jpeg,image/png,image/webp"
            name="file"
            required
            type="file"
          />
          <span className="admin-media-note">JPG, PNG or WebP. Maximum 10 MB.</span>
        </label>
        <label className="admin-field">
          Alt text
          <input
            maxLength={500}
            name="alt"
            placeholder="Describe what is shown"
            required
          />
        </label>
        <label className="admin-field">
          Credit / photographer
          <input maxLength={300} name="credit" />
        </label>
        <label className="admin-field">
          Licence
          <input maxLength={300} name="licence" />
        </label>
        <label className="admin-field">
          Source URL
          <input maxLength={2048} name="sourceUrl" type="url" />
        </label>
      </div>
      <div className="admin-upload-grid admin-upload-options">
        <label className="admin-checkbox">
          <input name="isSample" type="checkbox" value="true" />
          This is a sample photo that must be replaced.
        </label>
        <label className="admin-checkbox">
          <input name="hasPeople" type="checkbox" value="true" />
          Identifiable people appear in this photo.
        </label>
        <label className="admin-checkbox">
          <input name="consentRecorded" type="checkbox" value="true" />
          Permission to publish has been recorded.
        </label>
      </div>
      <button className="admin-button admin-button-primary" disabled={pending}>
        {pending ? "Uploading..." : "Upload photo"}
      </button>
      <p
        className={`admin-status${status?.error ? " admin-status-error" : ""}`}
        aria-live="polite"
      >
        {status?.message}
      </p>
    </form>
  );
}
