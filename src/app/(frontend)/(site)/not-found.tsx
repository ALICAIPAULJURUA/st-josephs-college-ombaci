import { getPageSchema } from "@/content/schemas/registry";
import { ContentTemplates } from "@/components/pages/ContentTemplates";
import { getHomeData } from "@/lib/home";
import { getPage, getSiteSettings } from "@/lib/content";

export default async function NotFound() {
  const [page, home, settings] = await Promise.all([
    getPage("not-found"),
    getHomeData(),
    getSiteSettings(),
  ]);
  const schema = getPageSchema("not-found");

  if (!page || !schema) {
    throw new Error(
      "The published not-found page is missing. Run pnpm seed to load the starting content.",
    );
  }

  return (
    <ContentTemplates
      admissions={home.admissions}
      items={[]}
      page={page}
      schema={schema}
      settings={settings}
    />
  );
}
