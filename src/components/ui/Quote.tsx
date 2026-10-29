import type { ReactNode } from "react";

export function Quote({
  children,
  attribution,
  className = "",
}: {
  children: ReactNode;
  attribution?: ReactNode;
  className?: string;
}) {
  return (
    <figure className={className}>
      <blockquote className="font-display text-[clamp(30px,3.6vw,48px)] font-extrabold uppercase leading-[1.05]">
        {children}
      </blockquote>
      {attribution ? (
        <figcaption className="mt-3 font-bold">{attribution}</figcaption>
      ) : null}
    </figure>
  );
}
