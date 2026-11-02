"use server";

import { randomUUID } from "node:crypto";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { requireAdminRole } from "@/lib/admin/auth";

export type UserActionState = {
  message?: string;
  error?: string;
};

const userInputSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(12).max(256),
  role: z.enum(["admin", "editor", "admissions"]),
});

export async function createStaffUserAction(
  _previousState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  await requireAdminRole(["admin"]);
  const parsed = userInputSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      error:
        "Please check the email address, choose a role, and use a password with at least 12 characters.",
    };
  }

  const email = parsed.data.email.trim().toLowerCase();
  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing) {
      return { error: "That email address already has an account." };
    }

    const now = Date.now();
    const passwordHash = await argon2.hash(parsed.data.password, {
      type: argon2.argon2id,
    });
    const inserted = await db
      .insert(users)
      .values({
        id: randomUUID(),
        email,
        passwordHash,
        role: parsed.data.role,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .returning({ id: users.id });

    return inserted.length > 0
      ? { message: "Staff account added." }
      : { error: "That email address already has an account." };
  } catch (error) {
    console.error("Could not create a staff account.", error);
    return { error: "We could not add that account. Please try again." };
  }
}

export async function resetStaffPasswordAction(
  _previousState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  await requireAdminRole(["admin"]);
  const parsed = z
    .object({
      userId: z.uuid(),
      password: z.string().min(12).max(256),
    })
    .safeParse({
      userId: formData.get("userId"),
      password: formData.get("password"),
    });

  if (!parsed.success) {
    return { error: "Use a new password with at least 12 characters." };
  }

  try {
    const passwordHash = await argon2.hash(parsed.data.password, {
      type: argon2.argon2id,
    });
    const updated = await db
      .update(users)
      .set({ passwordHash, updatedAt: Date.now() })
      .where(eq(users.id, parsed.data.userId))
      .returning({ id: users.id });

    return updated.length > 0
      ? { message: "Password updated." }
      : { error: "We could not find that staff account." };
  } catch (error) {
    console.error("Could not reset a staff password.", error);
    return { error: "We could not update that password. Please try again." };
  }
}
