"use client";

import Link from "next/link";
import { useState } from "react";

import { SitePhoto } from "@/components/ui/SitePhoto";
import { panels as seedPanels, type PanelSeed } from "@/content/seed";

export function PanelsHero({ items = seedPanels }: { items?: PanelSeed[] }) {
  const [active, setActive] = useState(0);
  const panels = items;

  return (
    <section
      aria-label="Explore the school"
      className="flex h-[640px] bg-navy max-[821px]:h-auto max-[821px]:flex-col"
      onPointerLeave={(event) => {
        if (!event.currentTarget.contains(document.activeElement)) {
          setActive(0);
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setActive(0);
        }
      }}
    >
      {panels.map((panel, index) => {
        const isActive = active === index;

        return (
          <Link
            key={panel.label}
            href={panel.href}
            aria-label={`${panel.label}: ${panel.description}`}
            className={[
              "group relative min-w-0 overflow-hidden border-r-4 border-navy text-white transition-[flex] duration-[550ms] motion-reduce:transition-none max-[821px]:h-[150px] max-[821px]:flex-none max-[821px]:border-b-4 max-[821px]:border-r-0",
              isActive ? "flex-[5]" : "flex-1",
            ].join(" ")}
            onPointerEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
          >
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
              className={[
                "absolute left-1/2 top-7 -translate-x-1/2 bg-yellow p-[14px_6px] font-display text-[42px] font-black uppercase leading-[1.2] tracking-[0.04em] text-navy transition-opacity duration-300 [writing-mode:vertical-rl]",
                "max-[821px]:bottom-4 max-[821px]:left-4 max-[821px]:top-auto max-[821px]:translate-x-0 max-[821px]:p-[8px_14px] max-[821px]:text-[30px] max-[821px]:opacity-100 max-[821px]:[writing-mode:horizontal-tb]",
                isActive ? "opacity-0" : "opacity-100",
              ].join(" ")}
            >
              {panel.label}
            </span>

            <div
              aria-hidden="true"
              className={[
                "absolute inset-x-0 bottom-0 min-w-[360px] bg-navy px-7 py-6 transition-opacity delay-150 duration-[350ms] max-[821px]:hidden",
                isActive ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              <h2 className="text-[48px] leading-[0.95] text-yellow">
                {panel.label}
              </h2>
              <p className="mt-2.5 max-w-[420px] text-[17px] leading-[1.45]">
                {panel.description}
              </p>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
