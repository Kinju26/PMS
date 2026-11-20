import {
  GENERIC_AUTH_ERROR,
  LOCKOUT_MINUTES,
  MAX_FAILED_ATTEMPTS,
  MFA_COOKIE,
  MFA_TTL_SECONDS,
  RESET_TTL_SECONDS,
} from "@/lib/auth/constants";
import { randomToken, sha256Hex } from "@/lib/auth/crypto";
import { sendAuthEmail } from "@/lib/auth/mail";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { postLoginPath } from "@/lib/auth/rbac";
import { isAuthRole } from "@/lib/auth/roles";
import { createSession } from "@/lib/auth/session";
import { verifyTotp } from "@/lib/auth/totp";
import type { PublicAuthResponse } from "@/lib/auth/types";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase();
}

async function findUser(identifier: string) {
  const key = normalizeIdentifier(identifier);
  return prisma.user.findFirst({
    where: {
      OR: [{ email: key }, { username: key }],
    },
  });
}

async function logEvent(input: {
  userId?: string | null;
  identifier: string;
  success: boolean;
  reason: string;
  ip: string;
  userAgent: string;
}) {
  await prisma.loginEvent.create({
    data: {
      userId: input.userId ?? undefined,
      identifier: normalizeIdentifier(input.identifier),
      success: input.success,
      reason: input.reason,
      ip: input.ip,
      userAgent: input.userAgent,
    },
  });
}

async function fail(reason: string, identifier: string, ip: string, userAgent: string, userId?: string | null, message = GENERIC_AUTH_ERROR): Promise<PublicAuthResponse> {
  await logEvent({ userId, identifier, success: false, reason, ip, userAgent });
  return { ok: false, message };
}

export async function authenticateWithPassword(input: {
  identifier: string;
  password: string;
  rememberMe: boolean;
  ip: string;
  userAgent: string;
}): Promise<PublicAuthResponse> {
  const user = await findUser(input.identifier);
  if (!user) {
    return fail("unknown_identifier", input.identifier, input.ip, input.userAgent);
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    return fail("locked", input.identifier, input.ip, input.userAgent, user.id, "This account is temporarily locked. Try again later.");
  }

  if (user.status === "INACTIVE") {
    return fail("inactive", input.identifier, input.ip, input.userAgent, user.id, "This account is not active. Contact your pharmacy administrator.");
  }

  if (user.status === "PENDING_ACTIVATION") {
    return fail("pending", input.identifier, input.ip, input.userAgent, user.id, "This account is not active. Contact your pharmacy administrator.");
  }

  if (user.status === "LOCKED") {
    return fail("admin_locked", input.identifier, input.ip, input.userAgent, user.id, "This account is temporarily locked. Try again later.");
  }

  const passwordOk = await verifyPassword(input.password, user.passwordHash);
  if (!passwordOk) {
    const failedLoginCount = user.failedLoginCount + 1;
    const lock = failedLoginCount >= MAX_FAILED_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount,
        lockedUntil: lock ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : user.lockedUntil,
      },
    });
    if (lock) {
      return fail("lockout", input.identifier, input.ip, input.userAgent, user.id, "This account is temporarily locked. Try again later.");
    }
    return fail("bad_password", input.identifier, input.ip, input.userAgent, user.id);
  }

  if (!isAuthRole(user.role)) {
    return fail("invalid_role", input.identifier, input.ip, input.userAgent, user.id);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  if (user.mfaEnabled) {
    if (!user.mfaSecret) {
      return fail("mfa_misconfigured", input.identifier, input.ip, input.userAgent, user.id);
    }
    const ticket = randomToken(24);
    const jar = await cookies();
    jar.set(MFA_COOKIE, JSON.stringify({ ticket: sha256Hex(ticket), userId: user.id, rememberMe: input.rememberMe, exp: Date.now() + MFA_TTL_SECONDS * 1000 }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: MFA_TTL_SECONDS,
    });
    await logEvent({ userId: user.id, identifier: input.identifier, success: false, reason: "mfa_required", ip: input.ip, userAgent: input.userAgent });
    return { ok: false, mfaRequired: true, message: "Enter the verification code from your authenticator app." };
  }

  await createSession(user.id, input.rememberMe, input.ip, input.userAgent);
  await logEvent({ userId: user.id, identifier: input.identifier, success: true, reason: "password", ip: input.ip, userAgent: input.userAgent });
  return { ok: true, redirectTo: postLoginPath(user.role) };
}

export async function authenticateWithMfa(input: {
  code: string;
  ip: string;
  userAgent: string;
}): Promise<PublicAuthResponse> {
  const jar = await cookies();
  const raw = jar.get(MFA_COOKIE)?.value;
  if (!raw) return { ok: false, message: GENERIC_AUTH_ERROR };

  let parsed: { ticket?: string; userId?: string; rememberMe?: boolean; exp?: number };
  try {
    parsed = JSON.parse(raw) as { ticket?: string; userId?: string; rememberMe?: boolean; exp?: number };
  } catch {
    return { ok: false, message: GENERIC_AUTH_ERROR };
  }

  if (!parsed.userId || !parsed.exp || parsed.exp < Date.now()) {
    jar.set(MFA_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return { ok: false, message: GENERIC_AUTH_ERROR };
  }

  const user = await prisma.user.findUnique({ where: { id: parsed.userId } });
  if (!user?.mfaEnabled || !user.mfaSecret || !isAuthRole(user.role)) {
    return { ok: false, message: GENERIC_AUTH_ERROR };
  }

  if (!verifyTotp(user.mfaSecret, input.code)) {
    await logEvent({ userId: user.id, identifier: user.email, success: false, reason: "mfa_invalid", ip: input.ip, userAgent: input.userAgent });
    return { ok: false, message: GENERIC_AUTH_ERROR };
  }

  jar.set(MFA_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  await createSession(user.id, Boolean(parsed.rememberMe), input.ip, input.userAgent);
  await logEvent({ userId: user.id, identifier: user.email, success: true, reason: "mfa", ip: input.ip, userAgent: input.userAgent });
  return { ok: true, redirectTo: postLoginPath(user.role) };
}

export async function requestPasswordReset(identifier: string, origin: string, ip: string, userAgent: string) {
  const user = await findUser(identifier);
  await logEvent({
    userId: user?.id,
    identifier,
    success: false,
    reason: user ? "reset_requested" : "reset_unknown",
    ip,
    userAgent,
  });

  if (user && user.status === "ACTIVE") {
    const token = randomToken(32);
    await prisma.passwordResetToken.create({
      data: {
        tokenHash: sha256Hex(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + RESET_TTL_SECONDS * 1000),
      },
    });
    const resetUrl = `${origin}/reset-password?token=${token}`;
    await sendAuthEmail({
      to: user.email,
      subject: "CPOS password reset",
      text: `A password reset was requested for your CPOS account. This link expires in 30 minutes:\n\n${resetUrl}\n\nIf you did not request this, ignore the message.`,
    });
  }

  return {
    ok: true,
    message: "If an account exists for those details, password reset instructions have been sent.",
  };
}

export async function resetPasswordWithToken(token: string, password: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: sha256Hex(token) },
    include: { user: true },
  });
  if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
    return { ok: false, message: "This reset link is invalid or has expired." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        failedLoginCount: 0,
        lockedUntil: null,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.session.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { ok: true, message: "Your password was updated. You can sign in now." };
}
