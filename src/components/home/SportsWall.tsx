import { SectionLabel } from "@/components/ui/SectionLabel";
import { SitePhoto } from "@/components/ui/SitePhoto";
import { Tag } from "@/components/ui/Tag";
import { sports as seedSports, type SportSeed } from "@/content/seed";

export function SportsWall({
  items = seedSports,
}: {
  items?: SportSeed[];
}) {
  return (
    <section className="bg-navy py-24 text-white max-[821px]:py-16">
      <div className="mx-auto max-w-[1320px] px-10 max-[821px]:px-5">
        <SectionLabel tone="yellow" className="mb-3.5">
          Sports
        </SectionLabel>
        <h2 className="text-[clamp(46px,6vw,88px)] leading-[0.9]">
          On the field
        </h2>

        <div className="sports-wall mt-10">
          {items.map((sport, index) => (
            <div
              key={sport.name ?? index}
              className="relative mb-3 break-inside-avoid"
            >
              <SitePhoto
                src={sport.photo.src}
                alt={sport.photo.alt}
                label={sport.photo.label}
                tone={sport.photo.tone}
                ratio={sport.photo.ratio}
                sizes="(max-width: 600px) 100vw, 25vw"
              />
              {sport.name ? (
                <Tag className="absolute bottom-3 left-3">{sport.name}</Tag>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
