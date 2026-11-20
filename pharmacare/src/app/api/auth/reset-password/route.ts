import { resetPasswordWithToken } from "@/lib/auth/authenticate";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(20),
  password: z.string().min(10).max(200),
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
    return Response.json({ ok: false, message: "Enter a new password of at least 10 characters." }, { status: 400 });
  }
  const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
