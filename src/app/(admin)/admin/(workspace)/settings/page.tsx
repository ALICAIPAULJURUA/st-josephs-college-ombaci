import type { Metadata } from "next";

import { PageEditor } from "../page-editor";

export const metadata: Metadata = {
  title: "Site settings",
};

export default async function AdminSettingsEditorRoute({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  return <PageEditor notice={notice} schemaKey="settings" />;
}
