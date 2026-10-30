import { SectionLabel } from "@/components/ui/SectionLabel";
import { SitePhoto } from "@/components/ui/SitePhoto";
import { StatCell } from "@/components/ui/StatCell";
import { RichText } from "@/components/ui/RichText";
import { Card } from "@/components/ui/Card";
import { photoFromPageMedia } from "@/lib/content";
import { safeHref } from "@/lib/links";
import type { Page } from "@/payload-types";

function resolveImage(block: {
  image?: (number | import("@/payload-types").Media | null) | null;
}) {
  return photoFromPageMedia(block.image, {
    alt: "Photo",
    label: "Photo",
    tone: "tint",
  });
}

function TextBlock({ block }: { block: Extract<NonNullable<Page["layout"]>[number], { blockType: "text" }> }) {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-[760px] px-10 max-[821px]:px-5">
        <RichText value={block.content?.root} />
      </div>
    </section>
  );
}

function ImageTextBlock({
  block,
}: {
  block: Extract<NonNullable<Page["layout"]>[number], { blockType: "imageText" }>;
}) {
  const photo = resolveImage(block);
  return (
    <section className="py-10 border-t border-line-navy">
      <div className="mx-auto max-w-[1320px] px-10 max-[821px]:px-5">
        <div className="flex flex-wrap gap-10 items-start max-[821px]:flex-col">
          <SitePhoto
            src={photo.src}
            alt={photo.alt}
            label={photo.label}
            tone="tint"
            ratio="4/3"
            sizes="(max-width: 820px) 100vw, 50vw"
            className="flex-1 basis-[320px] min-w-0"
          />
          <div className="flex-1 basis-[280px] min-w-0">
            {block.heading && (
              <h2 className="mb-4 text-[clamp(46px,6vw,88px)] font-black leading-[0.9] uppercase">
                {block.heading}
              </h2>
            )}
            <RichText value={block.body?.root} className="leading-[1.5]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesBlock({
  block,
}: {
  block: Extract<NonNullable<Page["layout"]>[number], { blockType: "features" }>;
}) {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-[1320px] px-10 max-[821px]:px-5">
        {block.heading && (
          <h2 className="mb-8 text-[clamp(46px,6vw,88px)] font-black leading-[0.9] uppercase">
            {block.heading}
          </h2>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {block.items?.map((item: { title: string; body?: string | null }, index: number) => (
            <Card key={index} className="p-7">
              <h3 className="mb-2 text-[28px] font-black leading-[0.95] uppercase">
                {item.title}
              </h3>
              {item.body && <p className="leading-[1.5]">{item.body}</p>}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBlock({
  block,
}: {
  block: Extract<NonNullable<Page["layout"]>[number], { blockType: "stats" }>;
}) {
  return (
    <section className="py-10 bg-mist border-t border-line-navy border-b border-line-navy">
      <div className="mx-auto max-w-[1320px] px-10 max-[821px]:px-5">
        {block.heading && (
          <h2 className="mb-8 text-[clamp(46px,6vw,88px)] font-black leading-[0.9] uppercase text-center">
            {block.heading}
          </h2>
        )}
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4 border-[3px] border-navy">
          {block.items?.map((item: { value: string; label: string }, index: number) => (
            <StatCell
              key={index}
              value={item.value}
              label={item.label}
              className={[
                "border-b-[3px] border-r-[3px] border-navy",
                index % 2 === 1 ? "border-b-0" : "",
                index === (block.items?.length ?? 0) - 1 ? "border-r-0" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryBlock({
  block,
}: {
  block: Extract<NonNullable<Page["layout"]>[number], { blockType: "gallery" }>;
}) {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-[1320px] px-10 max-[821px]:px-5">
        {block.heading && (
          <h2 className="mb-8 text-[clamp(46px,6vw,88px)] font-black leading-[0.9] uppercase">
            {block.heading}
          </h2>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {block.images?.map((image: { image?: number | import("@/payload-types").Media | null }, index: number) => {
            const photo = resolveImage(image);
            return (
              <SitePhoto
                key={index}
                src={photo.src}
                alt={photo.alt}
                label={photo.label}
                tone="tint"
                ratio="4/3"
                sizes="(max-width: 820px) 100vw, 33vw"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CallToActionBlock({
  block,
}: {
  block: Extract<NonNullable<Page["layout"]>[number], { blockType: "callToAction" }>;
}) {
  return (
    <section className="py-14 bg-navy text-white border-t border-line-navy border-b border-line-navy">
      <div className="mx-auto max-w-[760px] px-10 max-[821px]:px-5">
        <h2 className="mb-4 text-[clamp(46px,6vw,88px)] font-black leading-[0.9] uppercase">
          {block.heading}
        </h2>
        {block.body && (
          <div className="mb-8 leading-[1.5] text-soft">{block.body}</div>
        )}
        <a
          href={safeHref(block.linkHref, "#")}
          className="inline-block border-[3px] border-yellow bg-yellow text-navy font-black uppercase px-8 py-4 text-[17px] tracking-[0.06em] hover:scale-[1.02] transition-transform"
        >
          {block.linkLabel}
        </a>
      </div>
    </section>
  );
}

export function LayoutBlocks({ blocks }: { blocks: Page["layout"] | null }) {
  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block, index) => {
        switch (block.blockType) {
          case "text":
            return <TextBlock key={String(index)} block={block} />;
          case "imageText":
            return <ImageTextBlock key={String(index)} block={block} />;
          case "features":
            return <FeaturesBlock key={String(index)} block={block} />;
          case "stats":
            return <StatsBlock key={String(index)} block={block} />;
          case "gallery":
            return <GalleryBlock key={String(index)} block={block} />;
          case "callToAction":
            return <CallToActionBlock key={String(index)} block={block} />;
          default:
            return null;
        }
      })}
    </>
  );
}
