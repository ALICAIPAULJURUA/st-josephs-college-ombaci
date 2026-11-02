import Link from "next/link";

import { SitePhoto } from "@/components/ui/SitePhoto";
import { safeHref } from "@/lib/links";
import type { HomeData } from "@/lib/home";

export function PanelsHero({ items }: { items: HomeData["panels"] }) {
  return (
    <section
      aria-label="Explore the school"
      className="panels-hero flex h-[640px] bg-navy max-[821px]:h-auto max-[821px]:flex-col"
    >
      {items.map((panel, index) => (
          <Link
            key={panel.label}
            href={safeHref(panel.href)}
            className="group relative flex-1 min-w-0 overflow-hidden border-r-4 border-navy text-white transition-[flex] duration-[550ms] motion-reduce:transition-none max-[821px]:h-[150px] max-[821px]:flex-none max-[821px]:border-b-4 max-[821px]:border-r-0"
          >
            <span className="sr-only">
              {panel.description
                ? `${panel.label}: ${panel.description}`
                : panel.label}
            </span>
            <div aria-hidden="true" className="absolute inset-0">
              <SitePhoto
                src={panel.photo.src}
                alt=""
                label={panel.photo.label}
                tone={panel.photo.tone}
                sizes="(max-width: 820px) 100vw, 50vw"
                minHeight={0}
                priority={index === 0}
                className="h-full w-full"
              />
            </div>

            <span
              aria-hidden="true"
              className="panel-label absolute left-1/2 top-7 -translate-x-1/2 bg-yellow p-[14px_6px] font-display text-[42px] font-black uppercase leading-[1.2] tracking-[0.04em] text-navy transition-opacity duration-300 [writing-mode:vertical-rl] max-[821px]:bottom-4 max-[821px]:left-4 max-[821px]:top-auto max-[821px]:translate-x-0 max-[821px]:p-[8px_14px] max-[821px]:text-[30px] max-[821px]:opacity-100 max-[821px]:[writing-mode:horizontal-tb]"
            >
              {panel.label}
            </span>

            <div
              aria-hidden="true"
              className="panel-copy absolute inset-x-0 bottom-0 min-w-[360px] bg-navy px-7 py-6 opacity-0 transition-opacity delay-150 duration-[350ms] max-[821px]:hidden"
            >
              <h2 className="text-[48px] leading-[0.95] text-yellow">
                {panel.label}
              </h2>
              <p className="mt-2.5 max-w-[420px] text-[17px] leading-[1.45]">
                {panel.description}
              </p>
            </div>
          </Link>
      ))}
    </section>
  );
}
