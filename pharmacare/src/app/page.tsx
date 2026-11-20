import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginScreen } from "@/components/login/LoginScreen";
import { postLoginPath } from "@/lib/auth/rbac";
import { getCurrentSession } from "@/lib/auth/session";

export default function Home() {
  return (
    <Suspense fallback={<main className="h-dvh bg-navy" />}>
      <LoginGate />
    </Suspense>
  );
}

async function LoginGate() {
  const session = await getCurrentSession();
  if (session) redirect(postLoginPath(session.role));
  return <LoginScreen />;
}
