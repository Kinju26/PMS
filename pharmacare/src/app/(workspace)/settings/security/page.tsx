import { Suspense } from "react";
import { PageHeader, Section } from "@/components/cpos/fields";
import { ChangePasswordForm } from "@/components/login/ChangePasswordForm";
import { getCurrentSession } from "@/lib/auth/session";

export default function AdminSecurityPage() {
  return (
    <Suspense fallback={<div className="min-h-40 rounded-lg bg-white" />}>
      <AdminSecurityContent />
    </Suspense>
  );
}

async function AdminSecurityContent() {
  const session = await getCurrentSession();
  const forced = Boolean(session?.mustChangePassword);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Admin Settings"
        title="Security"
        description="Change the Super Admin password. The new password is stored as a one-way hash and is never shown in the browser."
      />
      <Section
        title={forced ? "Set a new password" : "Change password"}
        description="Use a unique password for this Master Admin account. Existing pharmacy records are not affected."
      >
        <ChangePasswordForm forced={forced} />
      </Section>
    </div>
  );
}
