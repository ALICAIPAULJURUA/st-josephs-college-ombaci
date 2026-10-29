import type { ReactNode } from "react";

export type SectionLabelTone = "navy" | "yellow";

export function SectionLabel({
  children,
  tone = "navy",
  className = "",
}: {
  children: ReactNode;
  tone?: SectionLabelTone;
  className?: string;
}) {
  return (
    <p
      className={`font-body text-[13px] font-bold uppercase tracking-[0.16em] ${
        tone === "yellow" ? "text-yellow" : "text-navy"
      } ${className}`}
    >
      {children}
    </p>
  );
}
