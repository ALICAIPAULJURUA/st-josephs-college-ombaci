import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { adminLandingPath, getAuthenticatedAdmin } from "@/lib/admin/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const sessionConfigured =
    Boolean(process.env.SESSION_SECRET) &&
    (process.env.SESSION_SECRET?.length ?? 0) >= 32;
  if (sessionConfigured) {
    const user = await getAuthenticatedAdmin();
    if (user) redirect(adminLandingPath(user.role));
  }

  const { expired } = await searchParams;

  return (
    <main className="admin-login-page">
      <section aria-labelledby="admin-login-title" className="admin-login-card">
        <p className="admin-eyebrow">St. Joseph&apos;s College, Ombaci</p>
        <h1 id="admin-login-title">School office</h1>
        <p>Sign in with the email address and password given to you.</p>
        {!sessionConfigured ? (
          <p className="admin-alert" role="alert">
            Admin sign-in is not set up yet. Ask the website administrator to
            add a secure SESSION_SECRET to the environment.
          </p>
        ) : (
          <LoginForm expired={expired === "1"} />
        )}
      </section>
    </main>
  );
}
