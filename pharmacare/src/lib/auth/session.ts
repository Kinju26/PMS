import "server-only";
import { cookies } from "next/headers";
import { IDLE_TTL_SECONDS, REMEMBER_TTL_SECONDS, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/auth/constants";
import { randomToken, sha256Hex } from "@/lib/auth/crypto";
import { permissionsForRole } from "@/lib/auth/rbac";
import { isAuthRole } from "@/lib/auth/roles";
import type { SessionUser } from "@/lib/auth/types";
import { prisma } from "@/lib/db";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge,
  };
}

export async function createSession(userId: string, rememberMe: boolean, ip: string, userAgent: string) {
  const token = randomToken(32);
  const ttl = rememberMe ? REMEMBER_TTL_SECONDS : SESSION_TTL_SECONDS;
  const expiresAt = new Date(Date.now() + ttl * 1000);
  await prisma.session.create({
    data: {
      tokenHash: sha256Hex(token),
      userId,
      rememberMe,
      expiresAt,
      lastSeenAt: new Date(),
      ip,
      userAgent,
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions(ttl));
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: sha256Hex(token) } });
  }
  jar.set(SESSION_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
}

export async function getCurrentSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const record = await prisma.session.findUnique({
    where: { tokenHash: sha256Hex(token) },
    include: { user: true },
  });
  if (!record) return null;

  const now = Date.now();
  if (record.expiresAt.getTime() <= now) {
    await prisma.session.delete({ where: { id: record.id } });
    return null;
  }

  const idleLimit = (record.rememberMe ? REMEMBER_TTL_SECONDS : IDLE_TTL_SECONDS) * 1000;
  if (now - record.lastSeenAt.getTime() > idleLimit) {
    await prisma.session.delete({ where: { id: record.id } });
    return null;
  }

  if (record.user.status !== "ACTIVE") {
    await prisma.session.delete({ where: { id: record.id } });
    return null;
  }

  if (!isAuthRole(record.user.role)) {
    await prisma.session.delete({ where: { id: record.id } });
    return null;
  }

  await prisma.session.update({
    where: { id: record.id },
    data: { lastSeenAt: new Date() },
  });

  return {
    id: record.user.id,
    name: record.user.name,
    email: record.user.email,
    username: record.user.username,
    role: record.user.role,
    permissions: permissionsForRole(record.user.role),
  };
}

export function hasSessionCookie(cookieHeader: string | null) {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((part) => part.trim().startsWith(`${SESSION_COOKIE}=`) && part.trim().length > SESSION_COOKIE.length + 1);
}
