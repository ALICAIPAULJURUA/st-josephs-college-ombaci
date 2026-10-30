import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHero } from "@/components/layout/PageHero";
import { ApplyBand } from "@/components/home/ApplyBand";
import { getPayload } from "payload";

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join("/");
  const payload = await getPayload({ config: (await import("@payload-config")).default });
  const result = await payload.find({
    collection: "pages",
    where: {
      slug: { equals: path },
      _status: { equals: "published" },
    },
    limit: 1,
    depth: 2,
    overrideAccess: false,
  });
  const page = result.docs[0];
  if (!page) notFound();
  return (
    <>
      <PageHero label={page.title} title={page.title} lead={page.summary ?? undefined} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.title }]} />
      <ApplyBand />
    </>
  );
}

