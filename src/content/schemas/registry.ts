import { homePageSchema } from "./home";
import { collectionSchemas } from "./collections";
import { innerPageSchemas } from "./inner-pages";
import type { PageSchema } from "./index";
import { settingsSchema } from "./settings";

export const pageSchemas = [
  homePageSchema,
  settingsSchema,
  ...innerPageSchemas,
] as const satisfies readonly PageSchema[];
export const collectionDefinitions = collectionSchemas;

export type PageSchemaKey = (typeof pageSchemas)[number]["key"];

export function getPageSchema(key: unknown): PageSchema | null {
  if (typeof key !== "string") return null;
  return pageSchemas.find((schema) => schema.key === key) ?? null;
}

export function getPageSchemaByRoute(route: string): PageSchema | null {
  return pageSchemas.find((schema) => schema.route === route) ?? null;
}
