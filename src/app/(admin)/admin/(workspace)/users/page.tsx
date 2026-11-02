import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { AddStaffUserForm, ResetStaffPasswordForm } from "./user-forms";

export const metadata: Metadata = {
  title: "Users",
};

export default async function AdminUsersPage() {
  const currentUser = await getAuthenticatedAdmin();
  if (!currentUser) redirect("/admin/login");
  if (currentUser.role !== "admin") redirect("/admin");

  const staff = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .orderBy(asc(users.email));

  return (
    <div className="admin-page">
      <header className="admin-page-heading">
        <p className="admin-eyebrow">Users</p>
        <h1>Staff accounts</h1>
        <p>Add staff members and reset their passwords.</p>
      </header>

      <div className="admin-section">
        <AddStaffUserForm />
      </div>

      <section aria-labelledby="staff-list-heading" className="admin-section">
        <h2 id="staff-list-heading">People with website access</h2>
        <ul className="admin-user-list">
          {staff.map((member) => (
            <li className="admin-user-row" key={member.id}>
              <div>
                <span className="admin-user-label">Email address</span>
                <strong className="admin-user-email">
                  {member.email}
                  {member.id === currentUser.id ? " (you)" : ""}
                </strong>
              </div>
              <div>
                <span className="admin-user-label">Role</span>
                <span>
                  {member.role === "admin"
                    ? "Administrator"
                    : member.role === "admissions"
                      ? "Admissions"
                      : "Editor"}
                </span>
              </div>
              <details className="admin-user-reset">
                <summary>Reset password</summary>
                <ResetStaffPasswordForm userId={member.id} />
              </details>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
