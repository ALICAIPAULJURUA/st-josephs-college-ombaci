import type { ReactNode } from "react";

import { SitePhoto, type PhotoTone } from "./SitePhoto";

export function RowFeature({
  number,
  title,
  body,
  facts,
  photo,
  reverse = false,
  className = "",
}: {
  number: string;
  title: string;
  body: ReactNode;
  facts: ReactNode[];
  photo: {
    src?: string;
    alt: string;
    label: string;
    tone?: PhotoTone;
  };
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex flex-wrap border-b-4 border-navy",
        reverse ? "flex-row-reverse max-[821px]:flex-row" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <SitePhoto
        src={photo.src}
        alt={photo.alt}
        label={photo.label}
        tone={photo.tone}
        sizes="(max-width: 820px) 100vw, 50vw"
        minHeight={300}
        className="min-w-0 flex-1 basis-[320px]"
      />
      <div className="flex min-w-0 flex-1 basis-[280px] flex-col justify-center px-7 py-9">
        <b className="outlined-number font-display text-[84px] font-black leading-[0.8]">
          {number}
        </b>
        <h3 className="mb-2.5 mt-3.5 text-[46px] leading-[0.95]">{title}</h3>
        <div className="mb-3.5 leading-[1.5]">{body}</div>
        <ul className="m-0 list-none p-0">
          {facts.map((fact, index) => (
            <li key={index} className="border-t border-line py-2 font-semibold">
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
