"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/lib/admin/login";

export type LoginState = {
  error?: string;
};

function clientAddress(forwardedFor: string | null, realIp: string | null) {
  const address = forwardedFor?.split(",")[0]?.trim() || realIp?.trim();
  return address?.slice(0, 100) || "unknown";
}

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Please enter your email address and password." };
  }

  let result;
  try {
    const requestHeaders = await headers();
    result = await signIn(
      email,
      password,
      clientAddress(
        requestHeaders.get("x-forwarded-for"),
        requestHeaders.get("x-real-ip"),
      ),
    );
  } catch (error) {
    console.error("Admin sign-in failed.", error);
    return {
      error:
        "Sign-in is temporarily unavailable. Please contact the website administrator.",
    };
  }

  if (result.error) return result;
  if (result.redirectTo) redirect(result.redirectTo);
  return { error: "We could not sign you in. Please try again." };
}

export async function logoutAction() {
  await signOut();
  redirect("/admin/login");
}
