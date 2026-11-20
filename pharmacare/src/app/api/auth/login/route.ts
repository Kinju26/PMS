import { authenticateWithMfa, authenticateWithPassword } from "@/lib/auth/authenticate";
import { clientIp, userAgent } from "@/lib/auth/request";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(120),
  password: z.string().min(1).max(200),
  rememberMe: z.boolean().optional(),
  mfaCode: z.string().optional(),
});

const attempts = new Map<string, { count: number; resetAt: number }>();

function tooManyFromIp(ip: string) {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 30;
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    if (process.env.NODE_ENV === "production" && tooManyFromIp(ip)) {
      return Response.json({ ok: false, message: "Too many sign-in attempts. Try again later." }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ ok: false, message: "Enter your email or username and password." }, { status: 400 });
    }

    const ua = userAgent(request);
    if (parsed.data.mfaCode) {
      const result = await authenticateWithMfa({ code: parsed.data.mfaCode, ip, userAgent: ua });
      return Response.json(result, { status: result.ok || result.mfaRequired ? 200 : 401 });
    }

    const result = await authenticateWithPassword({
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      rememberMe: Boolean(parsed.data.rememberMe),
      ip,
      userAgent: ua,
    });
    return Response.json(result, { status: result.ok || result.mfaRequired ? 200 : 401 });
  } catch (error) {
    console.error("POST /api/auth/login failed", error);
    return Response.json({ ok: false, message: "Unable to sign in right now. Please try again." }, { status: 500 });
  }
}
