import type { ReactNode } from "react";

export function StatCell({
  value,
  label,
  className = "",
}: {
  value: ReactNode;
  label: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 bg-yellow px-5 py-7 text-navy ${className}`}>
      <b className="block font-display text-[clamp(44px,13vw,80px)] font-black leading-[0.9]">
        {value}
      </b>
      <span className="text-base font-semibold leading-[1.2]">{label}</span>
    </div>
  );
}
