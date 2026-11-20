"use server";

import { redirect } from "next/navigation";
import { loginWithSuperAdmin, changeSuperAdminPassword } from "@/lib/auth/super-admin";
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
    return await loginWithSuperAdmin({
      identifier: input.identifier,
      password: input.password,
      rememberMe: input.rememberMe,
    });
  } catch {
    console.error("loginAction failed");
    return { ok: false, message: "Unable to sign in right now. Please try again." };
  }
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<PublicAuthResponse> {
  try {
    if (input.newPassword !== input.confirmPassword) {
      return { ok: false, message: "New password and confirmation do not match." };
    }
    return await changeSuperAdminPassword({
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    });
  } catch {
    console.error("changePasswordAction failed");
    return { ok: false, message: "Unable to update password right now." };
  }
}

export async function signOutAction() {
  await destroySession();
  redirect("/");
}
