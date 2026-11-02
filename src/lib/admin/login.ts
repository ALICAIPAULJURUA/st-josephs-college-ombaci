import { randomUUID } from "node:crypto";
import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { adminLandingPath } from "./auth";
import { getAdminSession } from "./session";
import {
  clearLoginFailures,
  isLoginLocked,
  loginAttemptKey,
  recordLoginFailure,
} from "./rate-limit";

export type LoginResult = {
  error?: string;
};

const validCredentialsSchema = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^[\s\S]{1,256}$/,
};

let timingHashPromise: Promise<string> | undefined;

function getTimingHash() {
  timingHashPromise ??= argon2.hash(randomUUID(), {
    type: argon2.argon2id,
  });
  return timingHashPromise;
}

export async function signIn(
  emailInput: string,
  passwordInput: string,
  address: string,
): Promise<LoginResult & { redirectTo?: string }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;

  if (
    email.length > 254 ||
    password.length > 256 ||
    !validCredentialsSchema.email.test(email) ||
    !validCredentialsSchema.password.test(password)
  ) {
    return { error: "Please check your email address and password." };
  }

  const attemptKey = loginAttemptKey(email, address);
  if (await isLoginLocked(attemptKey)) {
    return {
      error: "Too many sign-in attempts. Please wait 15 minutes before trying again.",
    };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const passwordMatches = await argon2.verify(
    user?.passwordHash ?? (await getTimingHash()),
    password,
  );

  if (!user || !passwordMatches) {
    await recordLoginFailure(attemptKey);
    return { error: "Please check your email address and password." };
  }

  await clearLoginFailures(attemptKey);
  const session = await getAdminSession();
  session.userId = user.id;
  session.lastActivityAt = Date.now();
  await session.save();

  return {
    redirectTo: adminLandingPath(user.role),
  };
}

export async function signOut() {
  const session = await getAdminSession();
  session.destroy();
}
