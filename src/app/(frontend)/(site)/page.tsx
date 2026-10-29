import { ApplyBand } from "@/components/home/ApplyBand";
import { HeroStrip } from "@/components/home/HeroStrip";
import { HonoursGrid } from "@/components/home/HonoursGrid";
import { LearningRows } from "@/components/home/LearningRows";
import { NumbersStrip } from "@/components/home/NumbersStrip";
import { OldBoysFeature } from "@/components/home/OldBoysFeature";
import { PanelsHero } from "@/components/home/PanelsHero";
import { SportsWall } from "@/components/home/SportsWall";
import { StaffCarousel } from "@/components/home/StaffCarousel";
import { getHomeData } from "@/lib/home";

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <HeroStrip />
      <PanelsHero items={data.panels} />
      <NumbersStrip items={data.numbers} />
      <LearningRows items={data.learningRows} />
      <SportsWall items={data.sports} />
      <StaffCarousel items={data.staff} />
      <HonoursGrid items={data.honours} />
      <OldBoysFeature data={data.oldBoys} />
      <ApplyBand />
    </>
  );
}
