import type { Metadata } from "next";
import { PageEditor } from "../../page-editor";

export const metadata: Metadata = {
  title: "Edit page",
};

export default async function AdminPageEditorRoute({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const [{ key }, { notice }] = await Promise.all([params, searchParams]);
  return <PageEditor notice={notice} schemaKey={key} />;
}
