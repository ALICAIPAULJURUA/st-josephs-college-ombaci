import { RowFeature } from "@/components/ui/RowFeature";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { HomeData } from "@/lib/home";

export function LearningRows({
  items,
  label,
  heading,
  intro,
}: {
  items: HomeData["learningRows"];
  label: string;
  heading: string;
  intro: string;
}) {
  return (
    <section className="bg-white py-24 max-[821px]:py-16">
      <div className="mx-auto max-w-[1320px] px-10 max-[821px]:px-5">
        <SectionLabel className="mb-3.5">{label}</SectionLabel>
        <h2 className="text-[clamp(46px,6vw,88px)] leading-[0.9]">{heading}</h2>
        <p className="mt-5 max-w-[760px] text-[17px] leading-[1.5]">{intro}</p>

        <div className="mt-12 border-t-4 border-navy">
          {items.map((row, index) => (
            <RowFeature
              key={row.number}
              number={row.number}
              title={row.title}
              body={row.body}
              facts={row.facts.map((fact) => (
                <span key={fact} className="text-[15px]">
                  {fact}
                </span>
              ))}
              photo={{
                src: row.photo.src,
                alt: row.photo.alt,
                label: row.photo.label,
                tone: row.photo.tone,
              }}
              reverse={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
