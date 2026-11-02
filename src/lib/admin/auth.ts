import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";

import {
  getAdminSession,
  sessionIsActive,
  type AdminSessionData,
} from "./session";

export type AdminRole = "admin" | "editor" | "admissions";

export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
};

const isAdminRole = (role: string): role is AdminRole =>
  role === "admin" || role === "editor" || role === "admissions";

export async function getAuthenticatedAdmin(): Promise<AdminUser | null> {
  const session = await getAdminSession();
  if (!sessionIsActive(session)) return null;

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.userId!))
    .limit(1);

  if (!user || !isAdminRole(user.role)) {
    return null;
  }

  return user;
}

export async function requireAdminRole(
  allowedRoles: readonly AdminRole[],
): Promise<AdminUser> {
  const user = await getAuthenticatedAdmin();
  if (!user) throw new Error("Please sign in again to continue.");
  if (!allowedRoles.includes(user.role)) {
    throw new Error("You do not have permission to do that.");
  }
  return user;
}

export function adminLandingPath(role: AdminRole) {
  if (role === "admissions") return "/admin/applications";
  return "/admin";
}

export function isAdminSessionActive(
  session: AdminSessionData,
  now?: number,
) {
  return sessionIsActive(session, now);
}
