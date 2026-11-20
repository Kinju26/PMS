import "server-only";
import { cookies } from "next/headers";
import { REMEMBER_TTL_SECONDS, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/auth/constants";
import { hmacSign, safeEqual } from "@/lib/auth/crypto";
import { permissionsForRole } from "@/lib/auth/rbac";
import { isAuthRole } from "@/lib/auth/roles";
import type { SessionUser } from "@/lib/auth/types";

type SignedSessionPayload = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  exp: number;
  rememberMe: boolean;
  mustChangePassword: boolean;
};

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge,
  };
}

function signingSecret() {
  return process.env.AUTH_SECRET?.trim() || "";
}

function encodeSession(payload: SignedSessionPayload, secret: string) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${hmacSign(body, secret)}`;
}

function decodeSession(token: string, secret: string): SignedSessionPayload | null {
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;
  const body = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!body || !signature) return null;
  const expected = hmacSign(body, secret);
  if (!safeEqual(signature, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SignedSessionPayload;
    if (!parsed.id || !parsed.email || !parsed.role || !parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function issueSignedSession(user: SessionUser, rememberMe: boolean) {
  const secret = signingSecret();
  if (!secret) {
    throw new Error("Missing AUTH_SECRET for session signing.");
  }
  const ttl = rememberMe ? REMEMBER_TTL_SECONDS : SESSION_TTL_SECONDS;
  const token = encodeSession(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      rememberMe,
      mustChangePassword: user.mustChangePassword,
      exp: Date.now() + ttl * 1000,
    },
    secret,
  );
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions(ttl));
}

export async function createSession(userId: string, rememberMe: boolean, _ip: string, _userAgent: string) {
  await issueSignedSession(
    {
      id: userId,
      name: "Super Admin",
      email: process.env.ADMIN_USER_ID?.trim() || process.env.DEMO_ADMIN_USER_ID?.trim() || "admin@cpos.local",
      username: "admin",
      role: "MASTER_ADMIN",
      permissions: permissionsForRole("MASTER_ADMIN"),
      mustChangePassword: true,
    },
    rememberMe,
  );
  return SESSION_COOKIE;
}

export async function destroySession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
}

export async function getCurrentSession(): Promise<SessionUser | null> {
  const secret = signingSecret();
  if (!secret) return null;
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = decodeSession(token, secret);
  if (!payload) return null;
  if (payload.exp <= Date.now()) {
    await destroySession();
    return null;
  }
  if (!isAuthRole(payload.role)) {
    await destroySession();
    return null;
  }

  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    username: payload.username,
    role: payload.role,
    permissions: permissionsForRole(payload.role),
    mustChangePassword: Boolean(payload.mustChangePassword),
  };
}

export function hasSessionCookie(cookieHeader: string | null) {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((part) => part.trim().startsWith(`${SESSION_COOKIE}=`) && part.trim().length > SESSION_COOKIE.length + 1);
}
