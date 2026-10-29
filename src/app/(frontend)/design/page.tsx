import type { Metadata } from "next";

import { FloatingActions } from "@/components/floating/FloatingActions";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { NoticeBar } from "@/components/layout/NoticeBar";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Placeholder } from "@/components/ui/Placeholder";
import { Quote } from "@/components/ui/Quote";
import { RowFeature } from "@/components/ui/RowFeature";
import { Rule } from "@/components/ui/Rule";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SitePhoto } from "@/components/ui/SitePhoto";
import { StatCell } from "@/components/ui/StatCell";
import { Tag } from "@/components/ui/Tag";

export const metadata: Metadata = {
  title: "Design system | St. Joseph's College Ombaci",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DesignPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:bg-yellow focus:px-5 focus:py-3 focus:font-bold focus:uppercase focus:text-navy"
      >
        Skip to content
      </a>
      <NoticeBar
        notice={{
          id: "design-preview",
          text: "Design route preview. This is not a published school notice.",
        }}
      />
      <Header />
      <main id="main">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Design" }]}
        />
        <PageHero
          label="Design system"
          title="Phase one"
          lead="Component and shell preview for the F Panels design."
        />

        <div className="py-16">
          <div className="mx-auto max-w-[1320px] space-y-16 px-10 max-[821px]:px-5">
            <section>
              <SectionLabel className="mb-3">Typography</SectionLabel>
              <h2 className="text-[clamp(46px,6vw,88px)] leading-[0.9]">
                Section heading
              </h2>
              <h3 className="mt-4 text-[46px] leading-[0.95]">
                Card and row heading
              </h3>
              <p className="mt-4 max-w-[640px] text-[17px] leading-[1.5]">
                Barlow body text at 17px. Plain English, short sentences, no
                hype.
              </p>
            </section>

            <section>
              <SectionLabel className="mb-4">Buttons</SectionLabel>
              <div className="flex flex-wrap gap-4">
                <Button>Primary action</Button>
                <Button variant="secondary">Secondary action</Button>
                <Button variant="outline">Outline action</Button>
                <Button href="/design">Link button</Button>
              </div>
            </section>

            <section>
              <SectionLabel className="mb-4">Tags and rules</SectionLabel>
              <div className="flex flex-wrap items-center gap-4">
                <Tag>Sports</Tag>
                <Tag>Honours</Tag>
              </div>
              <Rule className="mt-6" />
              <Rule tone="yellow" className="mt-4" />
            </section>

            <section>
              <SectionLabel className="mb-4">Photo slots</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SitePhoto
                  alt=""
                  label="Photo · Navy 4:3"
                  tone="navy"
                  ratio="4/3"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <SitePhoto
                  alt=""
                  label="Photo · Navy 2, 3:4"
                  tone="navy-2"
                  ratio="3/4"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <SitePhoto
                  alt=""
                  label="Photo · Green 1:1"
                  tone="green"
                  ratio="1/1"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <SitePhoto
                  alt=""
                  label="Photo · Tint 16:9"
                  tone="tint"
                  ratio="16/9"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <SitePhoto
                  alt=""
                  label="Photo · Mist 3:2"
                  tone="mist"
                  ratio="3/2"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <SitePhoto
                  alt=""
                  label="Photo · White 4:5"
                  tone="white"
                  ratio="4/5"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
            </section>

            <section>
              <SectionLabel className="mb-4">Placeholder and card</SectionLabel>
              <div className="flex flex-wrap items-center gap-4">
                <Placeholder>School phone</Placeholder>
                <Placeholder>Opening dates</Placeholder>
              </div>
              <Card className="mt-6 max-w-[560px] p-6">
                <h3 className="text-[32px] leading-[0.95]">Card heading</h3>
                <p className="mt-2 leading-[1.5]">
                  White card with a 3px navy border. Used for news, notices and
                  results.
                </p>
              </Card>
            </section>

            <section>
              <SectionLabel className="mb-4">Stat cells</SectionLabel>
              <div className="grid grid-cols-2 border-[3px] border-navy min-[821px]:grid-cols-4">
                <StatCell
                  value="1943"
                  label="Founded by the Comboni Missionaries"
                  className="border-b-[3px] border-r-[3px] border-navy min-[821px]:border-b-0"
                />
                <StatCell
                  value="1960"
                  label="Became a secondary school"
                  className="border-b-[3px] border-navy min-[821px]:border-b-0 min-[821px]:border-r-[3px]"
                />
                <StatCell
                  value="6"
                  label="Sports on the school field"
                  className="border-r-[3px] border-navy"
                />
                <StatCell value="O + A" label="UCE and UACE classes" />
              </div>
            </section>

            <section>
              <SectionLabel className="mb-4">Row feature</SectionLabel>
              <div className="border-t-4 border-navy">
                <RowFeature
                  number="01"
                  title="Science laboratories"
                  body={
                    <Placeholder>One line about the laboratories</Placeholder>
                  }
                  facts={[
                    <Placeholder key="labs">Number of labs</Placeholder>,
                    <Placeholder key="subjects">
                      Subjects practised
                    </Placeholder>,
                  ]}
                  photo={{
                    alt: "",
                    label: "Photo · Science laboratory",
                    tone: "navy",
                  }}
                />
              </div>
            </section>

            <section>
              <SectionLabel className="mb-4">Quote</SectionLabel>
              <Quote attribution="School motto">Primus inter pares</Quote>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}
