import Image from "next/image";
import type { RefObject } from "react";

export function AssistantLauncher({
  buttonRef,
  expanded,
  onToggle,
  className = "",
}: {
  buttonRef: RefObject<HTMLButtonElement | null>;
  expanded: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="Ask OMBACIAN Assistant"
      aria-expanded={expanded}
      aria-controls="ombacian-assistant-panel"
      aria-haspopup="dialog"
      onClick={onToggle}
      className={[
        "inline-flex min-h-11 items-center gap-3 rounded-full border-[3px] border-white bg-navy p-2 pr-[22px] text-[15px] font-bold leading-none text-white shadow-[0_0_0_3px_var(--navy)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-analytics="assistant_open"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
        <Image
          src="/crest.png"
          alt=""
          width={24}
          height={28}
          className="h-7 w-6 object-contain"
        />
      </span>
      <span className="max-[641px]:hidden">Ask OMBACIAN Assistant</span>
    </button>
  );
}
