"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      setOk(Boolean(result.ok));
      setMessage(result.message ?? "Unable to update the password.");
    } catch {
      setMessage("Unable to update the password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="w-full max-w-md rounded-3xl border border-line bg-white p-8">
      <p className="text-xs font-semibold tracking-[0.2em] text-[#087F8C] uppercase">CPOS</p>
      <h1 className="mt-3 text-2xl font-semibold text-navy">Reset password</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-xs font-semibold tracking-wide text-navy uppercase" htmlFor="password">
          New password
        </label>
        <input
          autoComplete="new-password"
          className="h-12 w-full rounded-xl border border-line px-3 text-sm focus:border-[#087F8C] focus:ring-4 focus:ring-[#087F8C]/15 focus:outline-none"
          id="password"
          minLength={10}
          name="password"
          required
          type="password"
        />
        <button className="h-12 w-full rounded-xl bg-[#087F8C] text-sm font-semibold text-white disabled:opacity-70" disabled={busy || !token} type="submit">
          {busy ? "Updating" : "Update password"}
        </button>
      </form>
      {message ? <p className="mt-4 text-sm text-ink">{message}</p> : null}
      {ok ? (
        <Link className="mt-6 inline-block text-sm font-semibold text-[#087F8C]" href="/">
          Sign in
        </Link>
      ) : (
        <Link className="mt-6 inline-block text-sm font-semibold text-[#087F8C]" href="/forgot-password">
          Request a new link
        </Link>
      )}
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F4F7F6] px-4">
      <Suspense fallback={<p className="text-sm text-muted">Loading reset form…</p>}>
        <ResetForm />
      </Suspense>
    </main>
  );
}
