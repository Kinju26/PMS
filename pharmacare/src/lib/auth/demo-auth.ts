import "server-only";
import { GENERIC_AUTH_ERROR } from "@/lib/auth/constants";
import { digestEqual } from "@/lib/auth/crypto";
import { postLoginPath, permissionsForRole } from "@/lib/auth/rbac";
import { issueSignedSession } from "@/lib/auth/session";
import type { PublicAuthResponse, SessionUser } from "@/lib/auth/types";

export function isDemoAuthEnabled() {
  const value = process.env.DEMO_AUTH_ENABLED?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

function demoAdminUser(): SessionUser | null {
  const identifier = process.env.DEMO_ADMIN_USER_ID?.trim() ?? "";
  if (!identifier) return null;
  const email = identifier.includes("@") ? identifier.toLowerCase() : `${identifier.toLowerCase()}@cpos.local`;
  const username = identifier.includes("@") ? identifier.split("@")[0] ?? identifier : identifier;
  return {
    id: "demo-system-admin",
    name: "System Administrator",
    email,
    username,
    role: "SYSTEM_ADMINISTRATOR",
    permissions: permissionsForRole("SYSTEM_ADMINISTRATOR"),
  };
}

export async function loginWithDemoCredentials(input: {
  identifier: string;
  password: string;
  rememberMe: boolean;
}): Promise<PublicAuthResponse> {
  if (!isDemoAuthEnabled()) {
    return { ok: false, message: "Sign-in is temporarily unavailable." };
  }

  const expectedUser = process.env.DEMO_ADMIN_USER_ID?.trim() ?? "";
  const expectedPassword = process.env.DEMO_ADMIN_PASSWORD ?? "";
  if (!expectedUser || !expectedPassword) {
    return { ok: false, message: "Sign-in is temporarily unavailable." };
  }

  const identifier = input.identifier.trim();
  const userMatches = digestEqual(identifier.toLowerCase(), expectedUser.toLowerCase());
  const passwordMatches = digestEqual(input.password, expectedPassword);
  if (!userMatches || !passwordMatches) {
    return { ok: false, message: GENERIC_AUTH_ERROR };
  }

  const user = demoAdminUser();
  if (!user) {
    return { ok: false, message: "Sign-in is temporarily unavailable." };
  }

  await issueSignedSession(user, input.rememberMe);
  return { ok: true, redirectTo: postLoginPath(user.role) };
}
