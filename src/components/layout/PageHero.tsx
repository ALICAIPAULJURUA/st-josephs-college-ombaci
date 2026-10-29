import type { ReactNode } from "react";

import { SectionLabel } from "@/components/ui/SectionLabel";

export function PageHero({
  label,
  title,
  lead,
  children,
}: {
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="border-t border-line-navy bg-navy py-14 text-white">
      <div className="mx-auto max-w-[1320px] px-10 max-[821px]:px-5">
        <SectionLabel tone="yellow" className="mb-3.5">
          {label}
        </SectionLabel>
        <h1 className="max-w-[1100px] text-[clamp(56px,9vw,128px)] font-black leading-[0.86]">
          {title}
        </h1>
        {lead ? (
          <p className="mt-6 max-w-[560px] text-[19px] leading-[1.5] text-soft">
            {lead}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
