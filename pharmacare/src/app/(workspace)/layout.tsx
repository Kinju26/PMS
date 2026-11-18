import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { WorkspaceShell } from "@/components/cpos/workspace-shell";
import { decodeSession, sessionCookieName } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "CPOS",
    template: "%s · CPOS",
  },
};

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F8FB]" />}>
      <SignedInShell>{children}</SignedInShell>
    </Suspense>
  );
}

async function SignedInShell({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const session = decodeSession(jar.get(sessionCookieName)?.value);
  if (!session) redirect("/");
  return <WorkspaceShell session={session}>{children}</WorkspaceShell>;
}
