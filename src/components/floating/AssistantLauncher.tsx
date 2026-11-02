import type { RefObject } from "react";

export function AssistantLauncher({
  buttonRef,
  expanded,
  onToggle,
  label,
  className = "",
}: {
  buttonRef: RefObject<HTMLButtonElement | null>;
  expanded: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      aria-controls="ombacian-assistant-panel"
      aria-haspopup="dialog"
      onClick={onToggle}
      className={[
        "group inline-flex h-12 w-12 items-center overflow-hidden rounded-full border-[3px] border-white bg-navy p-1.5 text-left text-[15px] font-bold leading-none text-white shadow-[0_0_0_3px_var(--navy)] transition-[width] duration-200 hover:w-[236px] focus-visible:w-[236px] aria-expanded:w-[236px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow motion-reduce:transition-none max-[640px]:w-[236px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-analytics="assistant_open"
    >
      <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-navy">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="square"
          strokeLinejoin="miter"
          className="size-6"
        >
          <path d="M5 5.5h14v10H12l-4.5 3v-3H5z" />
          <path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" />
        </svg>
        <span className="absolute right-0.5 top-0.5 size-2 border border-white bg-yellow" />
      </span>
      <span className="ml-3 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-200 group-hover:max-w-[176px] group-hover:opacity-100 group-focus-visible:max-w-[176px] group-focus-visible:opacity-100 group-aria-expanded:max-w-[176px] group-aria-expanded:opacity-100 motion-reduce:transition-none max-[640px]:max-w-[176px] max-[640px]:opacity-100">
        {label}
      </span>
    </button>
  );
}
