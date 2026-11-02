import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SitePhoto } from "@/components/ui/SitePhoto";
import type { HomeData } from "@/lib/home";

export function HonoursGrid({
  items,
  label,
  heading,
  intro,
}: {
  items: HomeData["honours"];
  label: string;
  heading: string;
  intro: string;
}) {
  return (
    <section className="bg-navy py-24 text-white max-[821px]:py-16">
      <div className="mx-auto max-w-[1320px] px-10 max-[821px]:px-5">
        <SectionLabel tone="yellow" className="mb-3.5">
          {label}
        </SectionLabel>
        <h2 className="text-[clamp(46px,6vw,88px)] leading-[0.9]">{heading}</h2>
        <p className="mt-5 max-w-[760px] text-[17px] leading-[1.5] text-soft">
          {intro}
        </p>

        <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {items.map((honour, index) => (
            <Card key={index}>
              <SitePhoto
                src={honour.photo.src}
                alt={honour.photo.alt}
                label={honour.photo.label}
                tone={honour.photo.tone}
                ratio={honour.photo.ratio}
                sizes="(max-width: 600px) 100vw, 25vw"
              />
              <div className="px-5 pb-[22px] pt-[18px]">
                <b className="block font-display text-[60px] font-black leading-[0.9] text-red">
                  {honour.year ?? ""}
                </b>
                <strong className="mt-1.5 block text-[20px]">
                  {honour.title ?? ""}
                </strong>
                <span>{honour.line ?? ""}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
