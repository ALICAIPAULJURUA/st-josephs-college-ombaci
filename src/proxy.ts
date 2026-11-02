import { getIronSession, nextProxyCookies } from "iron-session";
import { NextResponse, type NextRequest } from "next/server";

import { contentSecurityPolicy } from "./lib/headers";
import {
  ADMIN_SESSION_MAX_AGE_MS,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  ADMIN_SESSION_COOKIE,
  type AdminSessionData,
} from "./lib/admin/session";

function getOptions() {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) return null;

  return {
    cookieName: ADMIN_SESSION_COOKIE,
    password,
    ttl: ADMIN_SESSION_MAX_AGE_SECONDS,
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    },
  };
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = contentSecurityPolicy(
    nonce,
    process.env.NODE_ENV === "development",
    request.nextUrl.pathname === "/admin" ||
      request.nextUrl.pathname.startsWith("/admin/"),
  );
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", policy);

  const options = getOptions();
  if (!options) return response;
  const session = await getIronSession<AdminSessionData>(
    nextProxyCookies(request, response),
    options,
  );

  if (!session.userId || !session.lastActivityAt) return response;

  if (Date.now() - session.lastActivityAt >= ADMIN_SESSION_MAX_AGE_MS) {
    session.destroy();
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("expired", "1");
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.headers.set("Content-Security-Policy", policy);
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  }

  session.lastActivityAt = Date.now();
  await session.save();
  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|otf)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
