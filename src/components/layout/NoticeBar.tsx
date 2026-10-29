"use client";

import Link from "next/link";
import { useState } from "react";

export type Notice = {
  id: string;
  text: string;
  href?: string;
};

export function NoticeBar({ notice }: { notice?: Notice }) {
  const [dismissed, setDismissed] = useState<string | null>(null);

  if (!notice || dismissed === notice.id) return null;

  return (
    <div className="bg-yellow text-navy">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-4 gap-y-2 px-10 py-2.5 max-[821px]:px-5">
        <p className="text-[15px] font-semibold">
          {notice.href ? (
            <Link href={notice.href} className="underline underline-offset-2">
              {notice.text}
            </Link>
          ) : (
            notice.text
          )}
        </p>
        <button
          type="button"
          className="ml-auto min-h-11 border-[3px] border-navy px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] hover:bg-navy hover:text-white"
          onClick={() => setDismissed(notice.id)}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
