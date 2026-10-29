import type { ReactNode } from "react";

export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block border-2 border-yellow bg-navy px-2 py-1 font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-white">
      [Placeholder: {children}]
    </span>
  );
}
