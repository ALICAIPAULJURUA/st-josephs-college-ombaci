"use client";

import { useState } from "react";

export function ShareActions({ title }: { title: string }) {
  const [message, setMessage] = useState("");

  async function copyPageLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("Link copied.");
    } catch {
      setMessage(
        "Could not copy the link. Copy it from your browser address bar.",
      );
    }
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 border-t-2 border-line pt-5">
      <button
        className="min-h-11 border-[3px] border-navy bg-white px-4 font-bold uppercase text-navy hover:bg-yellow"
        onClick={copyPageLink}
        type="button"
      >
        Copy page link
      </button>
      <a
        className="min-h-11 border-[3px] border-navy bg-white px-4 py-2 font-bold uppercase text-navy hover:bg-yellow"
        href={`https://wa.me/?text=${encodeURIComponent(title)}`}
        onClick={(event) => {
          event.preventDefault();
          window.open(
            `https://wa.me/?text=${encodeURIComponent(`${title} ${window.location.href}`)}`,
            "_blank",
            "noopener,noreferrer",
          );
        }}
        rel="noopener noreferrer"
        target="_blank"
      >
        Share on WhatsApp
      </a>
      <span aria-live="polite" className="text-sm" role="status">
        {message}
      </span>
    </div>
  );
}
