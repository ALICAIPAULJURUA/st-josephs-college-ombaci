import { Placeholder } from "@/components/ui/Placeholder";
import { RowFeature } from "@/components/ui/RowFeature";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  learningRows as seedLearningRows,
  type LearningRowSeed,
} from "@/content/seed";

export function LearningRows({
  items = seedLearningRows,
}: {
  items?: LearningRowSeed[];
}) {
  return (
    <section className="bg-white py-24 max-[821px]:py-16">
      <div className="mx-auto max-w-[1320px] px-10 max-[821px]:px-5">
        <SectionLabel className="mb-3.5">Learning resources</SectionLabel>
        <h2 className="text-[clamp(46px,6vw,88px)] leading-[0.9]">
          Where the learning happens
        </h2>

        <div className="mt-12 border-t-4 border-navy">
          {items.map((row, index) => (
            <RowFeature
              key={row.number}
              number={row.number}
              title={row.title}
              body={
                row.body ?? <Placeholder>{row.bodyPlaceholder}</Placeholder>
              }
              facts={
                row.facts?.length
                  ? row.facts.map((fact) => (
                      <span key={fact} className="text-[15px]">
                        {fact}
                      </span>
                    ))
                  : row.factPlaceholders.map((fact) => (
                      <Placeholder key={fact}>{fact}</Placeholder>
                    ))
              }
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
