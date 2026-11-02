import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { HomeData } from "@/lib/home";

export function ApplyBand({ data }: { data: HomeData["admissions"] }) {
  return (
    <section
      id="apply"
      className="border-t-[12px] border-yellow bg-navy py-24 text-white max-[821px]:py-16"
    >
      <div className="mx-auto max-w-[1320px] px-10 max-[821px]:px-5">
        <SectionLabel tone="yellow" className="mb-[18px]">
          {data.label}
        </SectionLabel>
        <h2 className="text-[clamp(56px,9vw,128px)] leading-[0.86]">
          {data.title} <span className="text-yellow">{data.accent}</span>
        </h2>
        <p className="mb-8 mt-6 max-w-[560px] text-[19px] leading-[1.5] text-soft">
          {data.body}
        </p>
        <Button href={data.href}>{data.buttonLabel}</Button>
      </div>
    </section>
  );
}
