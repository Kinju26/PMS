import "server-only";
import { cookies } from "next/headers";
import {
  CREDENTIAL_COOKIE,
  GENERIC_AUTH_ERROR,
  MIN_NEW_PASSWORD_LENGTH,
  REMEMBER_TTL_SECONDS,
} from "@/lib/auth/constants";
import { digestEqual, hmacSign, safeEqual } from "@/lib/auth/crypto";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { permissionsForRole, postLoginPath } from "@/lib/auth/rbac";
import { issueSignedSession } from "@/lib/auth/session";
import type { PublicAuthResponse, SessionUser } from "@/lib/auth/types";

type CredentialVault = {
  hash: string;
  mustChange: boolean;
  userId: string;
};

function signingSecret() {
  return process.env.AUTH_SECRET?.trim() || "";
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge,
  };
}

function expectedUserId() {
  return (process.env.ADMIN_USER_ID ?? process.env.DEMO_ADMIN_USER_ID ?? "").trim();
}

function superAdminUser(mustChangePassword: boolean): SessionUser | null {
  const identifier = expectedUserId();
  if (!identifier) return null;
  const email = identifier.includes("@") ? identifier.toLowerCase() : `${identifier.toLowerCase()}@cpos.local`;
  const username = identifier.includes("@") ? (identifier.split("@")[0] ?? identifier) : identifier;
  return {
    id: "super-admin",
    name: "Super Admin",
    email,
    username,
    role: "MASTER_ADMIN",
    permissions: permissionsForRole("MASTER_ADMIN"),
    mustChangePassword,
  };
}

function encodeVault(vault: CredentialVault, secret: string) {
  const body = Buffer.from(JSON.stringify(vault), "utf8").toString("base64url");
  return `${body}.${hmacSign(body, secret)}`;
}

function decodeVault(token: string, secret: string): CredentialVault | null {
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;
  const body = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = hmacSign(body, secret);
  if (!safeEqual(signature, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as CredentialVault;
    if (!parsed.hash || !parsed.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function readVault(): Promise<CredentialVault | null> {
  const secret = signingSecret();
  if (!secret) return null;
  const token = (await cookies()).get(CREDENTIAL_COOKIE)?.value;
  if (!token) return null;
  return decodeVault(token, secret);
}

async function writeVault(vault: CredentialVault) {
  const secret = signingSecret();
  if (!secret) {
    throw new Error("Missing AUTH_SECRET for credential storage.");
  }
  const jar = await cookies();
  jar.set(CREDENTIAL_COOKIE, encodeVault(vault, secret), cookieOptions(REMEMBER_TTL_SECONDS));
}

async function bootstrapHash() {
  const configured = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (configured) return configured;
  const bootstrap = process.env.ADMIN_PASSWORD ?? process.env.DEMO_ADMIN_PASSWORD ?? "";
  if (!bootstrap) return "";
  return hashPassword(bootstrap);
}

export async function loginWithSuperAdmin(input: {
  identifier: string;
  password: string;
  rememberMe: boolean;
}): Promise<PublicAuthResponse> {
  const expectedUser = expectedUserId();
  const user = superAdminUser(false);
  if (!expectedUser || !user) {
    return { ok: false, message: "Sign-in is temporarily unavailable." };
  }

  const identifier = input.identifier.trim();
  if (!digestEqual(identifier.toLowerCase(), expectedUser.toLowerCase())) {
    return { ok: false, message: GENERIC_AUTH_ERROR };
  }

  const vault = await readVault();
  const hash = vault?.hash || (await bootstrapHash());
  if (!hash) {
    return { ok: false, message: "Sign-in is temporarily unavailable." };
  }

  const passwordOk = await verifyPassword(input.password, hash);
  if (!passwordOk) {
    return { ok: false, message: GENERIC_AUTH_ERROR };
  }

  const mustChangePassword = vault ? vault.mustChange : true;
  const signedIn = superAdminUser(mustChangePassword);
  if (!signedIn) {
    return { ok: false, message: "Sign-in is temporarily unavailable." };
  }

  await issueSignedSession(signedIn, input.rememberMe);
  return {
    ok: true,
    redirectTo: mustChangePassword ? "/settings/security" : postLoginPath(signedIn.role),
  };
}

export async function changeSuperAdminPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<PublicAuthResponse> {
  const expectedUser = expectedUserId();
  if (!expectedUser) {
    return { ok: false, message: "Unable to update password right now." };
  }

  const vault = await readVault();
  const hash = vault?.hash || (await bootstrapHash());
  if (!hash) {
    return { ok: false, message: "Unable to update password right now." };
  }

  const currentOk = await verifyPassword(input.currentPassword, hash);
  if (!currentOk) {
    return { ok: false, message: "Current password is incorrect." };
  }

  if (input.newPassword.trim().length < MIN_NEW_PASSWORD_LENGTH) {
    return { ok: false, message: `New password must be at least ${MIN_NEW_PASSWORD_LENGTH} characters.` };
  }
  if (input.newPassword === input.currentPassword) {
    return { ok: false, message: "Choose a new password that is different from the current password." };
  }

  const nextHash = await hashPassword(input.newPassword);
  await writeVault({
    hash: nextHash,
    mustChange: false,
    userId: expectedUser.toLowerCase(),
  });

  const user = superAdminUser(false);
  if (user) {
    await issueSignedSession(user, false);
  }

  return { ok: true, message: "Password updated.", redirectTo: postLoginPath("MASTER_ADMIN") };
}
