import type { ReactNode } from "react";

export function Tag({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block bg-yellow px-[10px] py-1 font-display text-[22px] font-black uppercase leading-none tracking-[0.04em] text-navy ${className}`}
    >
      {children}
    </span>
  );
}
