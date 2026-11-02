import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
export const ADMIN_SESSION_MAX_AGE_MS =
  ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
export const ADMIN_SESSION_COOKIE = "ombaci-admin";

export type AdminSessionData = {
  userId?: string;
  lastActivityAt?: number;
};

function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      "Admin sign-in needs SESSION_SECRET to be set to at least 32 characters.",
    );
  }

  return {
    cookieName: ADMIN_SESSION_COOKIE,
    password,
    ttl: ADMIN_SESSION_MAX_AGE_SECONDS,
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    },
  };
}

export function getAdminSessionOptions() {
  return sessionOptions();
}

export async function getAdminSession(): Promise<
  IronSession<AdminSessionData>
> {
  return getIronSession<AdminSessionData>(await cookies(), sessionOptions());
}

export function sessionIsActive(session: AdminSessionData, now = Date.now()) {
  return Boolean(
    session.userId &&
      session.lastActivityAt &&
      now - session.lastActivityAt < ADMIN_SESSION_MAX_AGE_MS,
  );
}
