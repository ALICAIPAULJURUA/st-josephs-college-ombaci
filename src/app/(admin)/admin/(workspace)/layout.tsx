import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { WorkspaceNav } from "../workspace-nav";

export default async function AdminWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getAuthenticatedAdmin();
  if (!user) redirect("/admin/login");

  return (
    <div className="admin-shell">
      <WorkspaceNav user={user} />
      <main className="admin-main" id="admin-main">
        {children}
      </main>
    </div>
  );
}
