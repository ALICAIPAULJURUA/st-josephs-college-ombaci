import { ApplyBand } from "@/components/home/ApplyBand";
import { HeroStrip } from "@/components/home/HeroStrip";
import { HonoursGrid } from "@/components/home/HonoursGrid";
import { LearningRows } from "@/components/home/LearningRows";
import { NumbersStrip } from "@/components/home/NumbersStrip";
import { NewsStrip } from "@/components/home/NewsStrip";
import { OldBoysFeature } from "@/components/home/OldBoysFeature";
import { PanelsHero } from "@/components/home/PanelsHero";
import { SportsWall } from "@/components/home/SportsWall";
import { StaffCarousel } from "@/components/home/StaffCarousel";
import { JsonLd, siteOrigin } from "@/components/seo/JsonLd";
import { getSiteSettings } from "@/lib/content";
import { getContentItems } from "@/lib/content";
import { getHomeData } from "@/lib/home";

export const revalidate = 60;

export default async function HomePage() {
  const [data, settings] = await Promise.all([
    getHomeData(),
    getSiteSettings(),
  ]);
  const news = data.newsStrip.enabled ? await getContentItems("news") : [];
  const origin = siteOrigin();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "@id": `${origin}/#school`,
          name: settings.schoolName,
          url: origin,
          description: settings.metaDescription,
          foundingDate: "1943",
          founder: {
            "@type": "Organization",
            name: "Comboni Missionaries",
          },
          motto: settings.motto,
          address: {
            "@type": "PostalAddress",
            streetAddress: settings.address,
            addressLocality: settings.city,
            addressRegion: settings.district,
            addressCountry: settings.country,
          },
          logo: new URL(settings.logo.src ?? "/crest.png", origin).toString(),
        }}
      />
      <HeroStrip data={data.hero} />
      <PanelsHero items={data.panels} />
      <NumbersStrip items={data.numbers} label={data.numbersLabel} />
      <LearningRows
        items={data.learningRows}
        label={data.learningLabel}
        heading={data.learningHeading}
        intro={data.learningIntro}
      />
      <SportsWall
        items={data.sports}
        label={data.sportsLabel}
        heading={data.sportsHeading}
        intro={data.sportsIntro}
      />
      <StaffCarousel
        items={data.staff}
        label={data.staffLabel}
        heading={data.staffHeading}
        intro={data.staffIntro}
      />
      <HonoursGrid
        items={data.honours}
        label={data.honoursLabel}
        heading={data.honoursHeading}
        intro={data.honoursIntro}
      />
      <OldBoysFeature
        data={data.oldBoys}
        label={data.oldBoysLabel}
        heading={data.oldBoysHeading}
        intro={data.oldBoysIntro}
      />
      {data.newsStrip.enabled ? (
        <NewsStrip
          heading={data.newsStrip.heading}
          items={news}
          label={data.newsStrip.label}
        />
      ) : null}
      <ApplyBand data={data.admissions} />
    </>
  );
}
