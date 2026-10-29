import Link from "next/link";

import { siteSettings } from "@/content/site";
import { trackEvent } from "@/lib/analytics";

export function ApplyNow({ className = "" }: { className?: string }) {
  return (
    <Link
      href={siteSettings.applyHref}
      onClick={() => trackEvent("apply_click")}
      className={[
        "floating-apply fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-6 z-[100] inline-flex min-h-11 items-center gap-2.5 rounded-full border-[3px] border-navy bg-yellow px-[26px] py-[15px] text-[18px] font-extrabold leading-none whitespace-nowrap text-navy max-[641px]:bottom-[calc(14px+env(safe-area-inset-bottom))] max-[641px]:left-3.5 max-[641px]:px-5 max-[641px]:py-[13px] max-[641px]:text-base",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-analytics="apply_click"
    >
      <span aria-hidden="true" className="apply-ring" />
      <span>Apply now</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}
