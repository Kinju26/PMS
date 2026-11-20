"use client";

import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { usePasswordVisibility } from "@/hooks/usePasswordVisibility";
import { ADMIN_ID, ADMIN_NAME, isAdminLogin } from "@/lib/admin-credentials";
import { writeSessionCookie } from "@/lib/auth";
import { readLoginCredentials } from "@/lib/login";

const adminIdSchema = z.string().trim().email("Enter a valid admin ID.");

const fieldClassName =
  "block h-10 w-full rounded-xl border border-white/80 bg-white/80 pr-4 pl-11 text-sm text-ink shadow-sm transition placeholder:text-muted/70 hover:border-[#1D9E75]/40 focus:border-[#1D9E75] focus:bg-white focus:ring-4 focus:ring-[#1D9E75]/15 focus:outline-none";

export function LoginForm() {
  const password = usePasswordVisibility();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "leaving">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const credentials = readLoginCredentials(event.currentTarget);
    const parsedId = adminIdSchema.safeParse(credentials.adminId);
    if (!parsedId.success) {
      setError(parsedId.error.issues[0]?.message ?? "Enter a valid admin ID.");
      return;
    }
    if (!credentials.password.trim()) {
      setError("Enter your password.");
      return;
    }
    if (!isAdminLogin(parsedId.data, credentials.password)) {
      setError("Invalid admin ID or password.");
      return;
    }

    setError(null);
    const cookieSaved = writeSessionCookie({ name: ADMIN_NAME, email: ADMIN_ID });
    if (!cookieSaved) {
      setError("Cookies are blocked in this browser. Enable cookies to sign in.");
      return;
    }

    setStatus("loading");
    window.setTimeout(() => {
      setStatus("leaving");
      window.setTimeout(() => {
        window.location.assign("/dashboard");
      }, 360);
    }, 500);
  }

  const busy = status !== "idle";

  return (
    <section
      className={`login-card relative mx-auto w-full max-w-[420px] rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-[0_30px_80px_-24px_rgba(16,35,58,0.55)] ring-1 ring-[#1D9E75]/25 backdrop-blur-xl ${
        status === "leaving" ? "login-card-leave" : ""
      }`}
    >
      <div className="mb-4 text-center">
        <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-xl bg-[#1D9E75] text-white shadow-[0_10px_24px_-12px_#1D9E75]">
          <Plus className="h-4 w-4" aria-hidden="true" />
        </div>
        <p className="text-base font-semibold tracking-tight text-ink">PharmaCare</p>
        <p className="text-[11px] font-medium tracking-wide text-muted uppercase">Pharmacy Management System</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Admin sign-in</h1>
        <p className="text-sm text-muted">Enter the administrator ID and password.</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-wide text-ink/80 uppercase" htmlFor="admin-id">
            Admin ID
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              className={fieldClassName}
              id="admin-id"
              name="admin-id"
              placeholder={ADMIN_ID}
              spellCheck={false}
              type="email"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-wide text-ink/80 uppercase" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              autoComplete="current-password"
              className={`${fieldClassName} pr-11`}
              id="password"
              name="password"
              placeholder="Enter your password"
              type={password.inputType}
            />
            <button
              aria-label={password.visible ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted transition hover:text-[#178666]"
              onClick={password.toggle}
              type="button"
            >
              {password.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          className="group flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1D9E75] to-[#1A6F8A] px-4 text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgba(26,111,138,0.9)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-12px_rgba(26,111,138,0.85)] focus:ring-4 focus:ring-[#1D9E75]/30 focus:outline-none active:translate-y-0 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
          disabled={busy}
          type="submit"
        >
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          <span>{busy ? "Signing in" : "Sign In"}</span>
          {busy ? null : <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </button>
      </form>
    </section>
  );
}
