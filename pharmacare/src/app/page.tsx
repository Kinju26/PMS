import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginScreen } from "@/components/login/LoginScreen";
import { decodeSession, sessionCookieName } from "@/lib/auth";

export default function Home() {
  return (
    <Suspense fallback={<main className="h-dvh bg-navy" />}>
      <LoginGate />
    </Suspense>
  );
}

async function LoginGate() {
  const jar = await cookies();
  const session = decodeSession(jar.get(sessionCookieName)?.value);
  if (session) redirect("/dashboard");
  return <LoginScreen />;
}
