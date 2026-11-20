import { getCurrentSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });
  return Response.json({
    ok: true,
    user: {
      id: session.id,
      name: session.name,
      email: session.email,
      username: session.username,
      role: session.role,
      permissions: session.permissions,
    },
  });
}
