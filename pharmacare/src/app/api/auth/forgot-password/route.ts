import { isDemoAuthEnabled } from "@/lib/auth/demo-auth";
import { clientIp, userAgent } from "@/lib/auth/request";
import { z } from "zod";

const schema = z.object({
  identifier: z.string().trim().min(3).max(120),
});

const genericMessage = "If an account exists for those details, password reset instructions have been sent.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success || isDemoAuthEnabled()) {
    return Response.json({ ok: true, message: genericMessage });
  }

  const { requestPasswordReset } = await import("@/lib/auth/authenticate");
  const origin = new URL(request.url).origin;
  const result = await requestPasswordReset(parsed.data.identifier, origin, clientIp(request), userAgent(request));
  return Response.json(result);
}
