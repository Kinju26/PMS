import "server-only";
import { loginWithSuperAdmin } from "@/lib/auth/super-admin";

export function isDemoAuthEnabled() {
  const value = process.env.DEMO_AUTH_ENABLED?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes" || value === undefined || value === "";
}

export async function loginWithDemoCredentials(input: {
  identifier: string;
  password: string;
  rememberMe: boolean;
}) {
  return loginWithSuperAdmin(input);
}
