import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-[3px] border-navy bg-white text-navy ${className}`}>
      {children}
    </div>
  );
}
