import { Button } from "@/components/ui/Button";
import type { HomeData } from "@/lib/home";

export function HeroStrip({ data }: { data: HomeData["hero"] }) {
  return (
    <section className="border-t border-line-navy bg-navy px-10 pb-10 pt-14 text-white max-[821px]:px-5">
      <div className="mx-auto max-w-[1320px]">
        <h1 className="text-[clamp(64px,11.5vw,168px)] font-black leading-[0.84]">
          {data.title} <span className="text-yellow">{data.accent}</span>
        </h1>

        <div className="mt-7 max-w-[380px]">
          <p className="text-[18px] leading-[1.5] text-soft">
            {data.body}{" "}
            <span className="[@media(hover:hover)]:hidden">
              {data.touchHint}
            </span>
            <span className="hidden [@media(hover:hover)]:inline">
              {data.panelHint}
            </span>
          </p>
          <Button href={data.admissionsHref} className="mt-5">
            {data.admissionsLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
