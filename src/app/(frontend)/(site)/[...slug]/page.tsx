import { notFound } from "next/navigation";

import { ApplyBand } from "@/components/home/ApplyBand";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHero } from "@/components/layout/PageHero";
import { getPage } from "@/lib/content";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join("/");
  const page = await getPage(path);

  if (!page) notFound();

  return (
    <>
      <PageHero
        label={page.title}
        title={page.title}
        lead={page.summary ?? undefined}
      />
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: page.title }]}
      />
      <ApplyBand />
    </>
  );
}
