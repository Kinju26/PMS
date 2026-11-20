"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const identifier = String(new FormData(event.currentTarget).get("identifier") ?? "");
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const result = (await response.json()) as { message?: string };
      setMessage(result.message ?? "If an account exists for those details, password reset instructions have been sent.");
    } catch {
      setMessage("If an account exists for those details, password reset instructions have been sent.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F4F7F6] px-4">
      <section className="w-full max-w-md rounded-3xl border border-line bg-white p-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#087F8C] uppercase">CPOS</p>
        <h1 className="mt-3 text-2xl font-semibold text-navy">Forgot password</h1>
        <p className="mt-2 text-sm text-muted">Enter the email or username on your registered account. We will not confirm whether that account exists.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-xs font-semibold tracking-wide text-navy uppercase" htmlFor="identifier">
            Email or username
          </label>
          <input
            autoCapitalize="none"
            className="h-12 w-full rounded-xl border border-line px-3 text-sm focus:border-[#087F8C] focus:ring-4 focus:ring-[#087F8C]/15 focus:outline-none"
            id="identifier"
            name="identifier"
            required
            type="text"
          />
          <button className="h-12 w-full rounded-xl bg-[#087F8C] text-sm font-semibold text-white disabled:opacity-70" disabled={busy} type="submit">
            {busy ? "Sending" : "Send reset instructions"}
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-ink">{message}</p> : null}
        <Link className="mt-6 inline-block text-sm font-semibold text-[#087F8C]" href="/">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
