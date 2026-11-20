import { requestPasswordReset } from "@/lib/auth/authenticate";
import { clientIp, userAgent } from "@/lib/auth/request";
import { z } from "zod";

const schema = z.object({
  identifier: z.string().trim().min(3).max(120),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({
      ok: true,
      message: "If an account exists for those details, password reset instructions have been sent.",
    });
  }

  const origin = new URL(request.url).origin;
  const result = await requestPasswordReset(parsed.data.identifier, origin, clientIp(request), userAgent(request));
  return Response.json(result);
}
