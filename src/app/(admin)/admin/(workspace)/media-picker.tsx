"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export type EditorMediaItem = {
  id: string;
  url: string;
  alt: string;
  isSample: boolean;
};

export function MediaPickerDialog({
  items,
  onChoose,
  onClose,
}: {
  items: readonly EditorMediaItem[];
  onChoose: (item: EditorMediaItem) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const currentDialog = dialog.current;
    currentDialog?.showModal();
    return () => {
      if (currentDialog?.open) currentDialog.close();
    };
  }, []);

  const filteredItems = items.filter((item) =>
    item.alt.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <dialog
      aria-labelledby="media-picker-title"
      className="admin-picker-dialog"
      onClose={onClose}
      ref={dialog}
    >
      <div className="admin-picker-heading">
        <div>
          <p className="admin-eyebrow">Photos and files</p>
          <h2 id="media-picker-title">Choose a photo</h2>
        </div>
        <button className="admin-button" onClick={onClose} type="button">
          Close
        </button>
      </div>
      <label className="admin-field">
        Search photo descriptions
        <input
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
          value={query}
        />
      </label>
      {filteredItems.length > 0 ? (
        <div className="admin-picker-grid">
          {filteredItems.map((item) => (
            <button
              className="admin-picker-item"
              key={item.id}
              onClick={() => onChoose(item)}
              type="button"
            >
              <Image
                alt=""
                height={110}
                unoptimized
                src={item.url}
                width={220}
              />
              <span>{item.alt}</span>
              {item.isSample ? (
                <span className="admin-sample-badge">Sample photo</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : (
        <p className="admin-picker-empty">
          {query
            ? "No photos match that description."
            : "No photos are available yet. Upload one in Photos and files first."}
        </p>
      )}
    </dialog>
  );
}
