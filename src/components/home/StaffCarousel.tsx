"use client";

import { useRef } from "react";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { SitePhoto } from "@/components/ui/SitePhoto";
import type { HomeData } from "@/lib/home";

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      className="h-5 w-5"
    >
      {direction === "left" ? (
        <path d="M15 5 8 12l7 7" />
      ) : (
        <path d="m9 5 7 7-7 7" />
      )}
    </svg>
  );
}

export function StaffCarousel({
  items,
  label,
  heading,
  intro,
}: {
  items: HomeData["staff"];
  label: string;
  heading: string;
  intro: string;
}) {
  const track = useRef<HTMLUListElement>(null);

  function move(direction: -1 | 1) {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    track.current?.scrollBy({
      left: direction * 276,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  return (
    <section className="bg-mist py-24 max-[821px]:py-16">
      <div className="mx-auto max-w-[1320px] px-10 max-[821px]:px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel className="mb-3.5">{label}</SectionLabel>
            <h2 className="text-[clamp(46px,6vw,88px)] leading-[0.9]">
              {heading}
            </h2>
            <p className="mt-5 max-w-[760px] text-[17px] leading-[1.5]">
              {intro}
            </p>
          </div>

          <div className="ml-auto flex gap-2">
            <button
              type="button"
              aria-label="Previous staff"
              className="inline-flex size-11 items-center justify-center border-[3px] border-navy bg-white text-navy hover:bg-yellow focus-visible:outline-navy"
              onClick={() => move(-1)}
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="Next staff"
              className="inline-flex size-11 items-center justify-center border-[3px] border-navy bg-white text-navy hover:bg-yellow focus-visible:outline-navy"
              onClick={() => move(1)}
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>

        <ul
          ref={track}
          aria-label="Staff carousel"
          tabIndex={0}
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 [scrollbar-color:var(--navy)_var(--tint)]"
        >
          {items.map((member, index) => (
            <li
              key={index}
              className="w-[260px] flex-none snap-start border-[3px] border-navy bg-white"
            >
              <SitePhoto
                src={member.photo.src}
                alt={member.photo.alt}
                label={member.photo.label}
                tone={member.photo.tone}
                ratio={member.photo.ratio}
                sizes="260px"
                minHeight={0}
              />
              <div className="px-4 pb-[18px] pt-3.5">
                <b className="block font-display text-[28px] font-extrabold uppercase leading-none">
                  {member.name ?? ""}
                </b>
                <span className="text-[15px]">{member.role ?? ""}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
