"use server";

import { redirect } from "next/navigation";
import { loginWithDemoCredentials } from "@/lib/auth/demo-auth";
import type { PublicAuthResponse } from "@/lib/auth/types";
import { destroySession } from "@/lib/auth/session";

export async function loginAction(input: {
  identifier: string;
  password: string;
  rememberMe: boolean;
  mfaCode?: string;
}): Promise<PublicAuthResponse> {
  try {
    if (input.mfaCode) {
      return { ok: false, message: "Invalid User ID or Password. Please try again." };
    }
    return await loginWithDemoCredentials({
      identifier: input.identifier,
      password: input.password,
      rememberMe: input.rememberMe,
    });
  } catch (error) {
    console.error("loginAction failed", error);
    return { ok: false, message: "Unable to sign in right now. Please try again." };
  }
}

export async function signOutAction() {
  await destroySession();
  redirect("/");
}
