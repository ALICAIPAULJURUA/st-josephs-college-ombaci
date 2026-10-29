import { Button } from "@/components/ui/Button";
import { Placeholder } from "@/components/ui/Placeholder";
import { Quote } from "@/components/ui/Quote";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SitePhoto } from "@/components/ui/SitePhoto";
import { oldBoys as seedOldBoys, type OldBoysSeed } from "@/content/seed";

export function OldBoysFeature({
  data = seedOldBoys,
}: {
  data?: OldBoysSeed;
}) {
  const oldBoys = data;
  return (
    <section className="bg-yellow py-24 max-[821px]:py-16">
      <div className="mx-auto max-w-[1320px] px-10 max-[821px]:px-5">
        <SectionLabel className="mb-3.5">Old Boys</SectionLabel>
        <h2 className="text-[clamp(46px,6vw,88px)] leading-[0.9]">
          Ombacians, wherever they go
        </h2>

        <div className="mt-10 flex flex-wrap items-stretch gap-10">
          <div className="min-w-0 flex-[1_1_460px]">
            <SitePhoto
              src={oldBoys.featured.photo.src}
              alt={oldBoys.featured.photo.alt}
              label={oldBoys.featured.photo.label}
              tone={oldBoys.featured.photo.tone}
              ratio={oldBoys.featured.photo.ratio}
              sizes="(max-width: 820px) 100vw, 55vw"
            />
            <Quote
              className="mt-5"
              attribution={
                <>
                  {oldBoys.featured.name ? (
                    oldBoys.featured.name
                  ) : (
                    <Placeholder>
                      {oldBoys.featured.namePlaceholder}
                    </Placeholder>
                  )}
                  {", "}
                  {oldBoys.featured.meta ? (
                    oldBoys.featured.meta
                  ) : (
                    <Placeholder>
                      {oldBoys.featured.metaPlaceholder}
                    </Placeholder>
                  )}
                </>
              }
            >
              {oldBoys.featured.quote ? (
                oldBoys.featured.quote
              ) : (
                <Placeholder>{oldBoys.featured.quotePlaceholder}</Placeholder>
              )}
            </Quote>
          </div>

          <div className="flex min-w-0 flex-[1_1_380px] flex-col border-t-4 border-navy">
            {oldBoys.list.map((person, index) => (
              <div
                key={index}
                className="flex items-center gap-4 border-b-2 border-navy py-4"
              >
                <SitePhoto
                  src={person.photo.src}
                  alt={person.photo.alt}
                  label={person.photo.label}
                  tone={person.photo.tone}
                  ratio={person.photo.ratio}
                  sizes="96px"
                  minHeight={0}
                  className="flex-[0_0_96px] px-1 py-1 text-[10px]"
                />
                <div>
                  <b className="block font-display text-[28px] font-extrabold uppercase leading-none">
                    {person.name ? (
                      person.name
                    ) : (
                      <Placeholder>{person.namePlaceholder}</Placeholder>
                    )}
                  </b>
                  <span>
                    {person.meta ? (
                      person.meta
                    ) : (
                      <Placeholder>{person.metaPlaceholder}</Placeholder>
                    )}
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-6">
              <Button href={oldBoys.joinHref} variant="secondary">
                Join the Old Boys group
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
