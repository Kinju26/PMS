import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { WorkspaceShell } from "@/components/cpos/workspace-shell";
import { roleHasPermission } from "@/lib/auth/rbac";
import { getCurrentSession } from "@/lib/auth/session";

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
  const session = await getCurrentSession();
  if (!session) redirect("/");
  if (!roleHasPermission(session.role, "access_workspace")) redirect("/home");
  return <WorkspaceShell session={session}>{children}</WorkspaceShell>;
}
