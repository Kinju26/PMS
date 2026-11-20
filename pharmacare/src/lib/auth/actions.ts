"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authenticateWithMfa, authenticateWithPassword } from "@/lib/auth/authenticate";
import type { PublicAuthResponse } from "@/lib/auth/types";
import { destroySession } from "@/lib/auth/session";

function requestMeta(headerList: Headers) {
  const forwarded = headerList.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
  const userAgent = headerList.get("user-agent") ?? "unknown";
  return { ip, userAgent };
}

export async function loginAction(input: {
  identifier: string;
  password: string;
  rememberMe: boolean;
  mfaCode?: string;
}): Promise<PublicAuthResponse> {
  try {
    const { ip, userAgent } = requestMeta(await headers());
    if (input.mfaCode) {
      return await authenticateWithMfa({ code: input.mfaCode, ip, userAgent });
    }
    return await authenticateWithPassword({
      identifier: input.identifier,
      password: input.password,
      rememberMe: input.rememberMe,
      ip,
      userAgent,
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
