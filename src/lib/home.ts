import { buildValidator, type PageFields } from "@/content/schemas";
import { homePageSchema } from "@/content/schemas/home";
import { getPage } from "@/db/queries";

export type HomeData = PageFields<typeof homePageSchema.fields>;

export async function getHomeData(): Promise<HomeData> {
  const page = await getPage(homePageSchema.key);
  if (!page) {
    throw new Error(
      "The published Home page is missing from the database. Run pnpm seed to load the starting content.",
    );
  }

  const result = buildValidator(homePageSchema).safeParse(page.fields);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`The published Home page is invalid: ${issues}`);
  }

  return result.data;
}
