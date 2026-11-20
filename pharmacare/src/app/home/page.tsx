import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signOutAction } from "@/lib/auth/actions";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { getCurrentSession } from "@/lib/auth/session";

export default function SignedInHome() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-[#F4F7F6]" />}>
      <SignedInHomeContent />
    </Suspense>
  );
}

async function SignedInHomeContent() {
  const session = await getCurrentSession();
  if (!session) redirect("/");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F4F7F6] px-4">
      <section className="w-full max-w-lg rounded-2xl border border-line bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#168b83] uppercase">Canadian Pharmacy Operating System</p>
        <h1 className="mt-3 text-2xl font-semibold text-navy">You are signed in</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Authentication succeeded for <span className="font-medium text-ink">{session.name}</span> as{" "}
          <span className="font-medium text-ink">{ROLE_LABELS[session.role]}</span>. Dashboard screens for this role
          are paused until the login phase is reviewed and approved.
        </p>
        <form action={signOutAction} className="mt-6">
          <button className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700" type="submit">
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
