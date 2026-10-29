import { Button } from "@/components/ui/Button";
import { hero } from "@/content/seed";

export function HeroStrip() {
  return (
    <section className="border-t border-line-navy bg-navy px-10 pb-10 pt-14 text-white max-[821px]:px-5">
      <div className="mx-auto max-w-[1320px]">
        <h1 className="text-[clamp(64px,11.5vw,168px)] font-black leading-[0.84]">
          {hero.title} <span className="text-yellow">{hero.accent}</span>
        </h1>

        <div className="mt-7 max-w-[380px]">
          <p className="text-[18px] leading-[1.5] text-soft">
            {hero.body}{" "}
            <span className="[@media(hover:hover)]:hidden">
              {hero.touchHint}
            </span>
            <span className="hidden [@media(hover:hover)]:inline">
              {hero.panelHint}
            </span>
          </p>
          <Button href={hero.admissionsHref} className="mt-5">
            Admissions
          </Button>
        </div>
      </div>
    </section>
  );
}
