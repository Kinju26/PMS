"use client";

import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Plus, UserRound, type LucideIcon } from "lucide-react";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { z } from "zod";
import { usePasswordVisibility } from "@/hooks/usePasswordVisibility";
import { findAccount, hashPassword, saveAccount, writeSessionCookie } from "@/lib/auth";
import { readLoginCredentials } from "@/lib/login";

const rememberedEmailKey = "pharmacare.remembered-email";

function subscribeToRememberedEmail(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function readRememberedEmail() {
  try {
    return window.localStorage.getItem(rememberedEmailKey) ?? "";
  } catch {
    return "";
  }
}

function emptyRememberedEmail() {
  return "";
}

const emailSchema = z.string().trim().email("Enter a valid work email address.");
const nameSchema = z.string().trim().min(2, "Enter the account holder's name.");
const passwordSchema = z.string().min(8, "Use at least 8 characters for the password.");

type AuthMode = "sign-in" | "create";

const fieldClassName =
  "block h-10 w-full rounded-xl border border-white/80 bg-white/80 pr-4 pl-11 text-sm text-ink shadow-sm transition placeholder:text-muted/70 hover:border-[#1D9E75]/40 focus:border-[#1D9E75] focus:bg-white focus:ring-4 focus:ring-[#1D9E75]/15 focus:outline-none";

function MicrosoftMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
      <path fill="#f35325" d="M1 1h6.5v6.5H1z" />
      <path fill="#81bc06" d="M8.5 1H15v6.5H8.5z" />
      <path fill="#05a6f0" d="M1 8.5h6.5V15H1z" />
      <path fill="#ffba08" d="M8.5 8.5H15V15H8.5z" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="h-4 w-4">
      <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z" />
      <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3z" />
      <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z" />
    </svg>
  );
}

export function LoginForm() {
  const password = usePasswordVisibility();
  const rememberedEmail = useSyncExternalStore(subscribeToRememberedEmail, readRememberedEmail, emptyRememberedEmail);
  const [email, setEmail] = useState<string | null>(null);
  const [rememberChoice, setRememberChoice] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "leaving">("idle");
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const emailValue = email ?? rememberedEmail;
  const remember = rememberChoice ?? rememberedEmail.length > 0;

  function openMode(next: AuthMode) {
    setMode(next);
    setError(null);
    setNotice(null);
    setForgotOpen(false);
    setStatus("idle");
  }

  function enterWorkspace(user: { name: string; email: string }) {
    const cookieSaved = writeSessionCookie(user);
    if (!cookieSaved) {
      setError("Cookies are blocked in this browser. Enable cookies to sign in.");
      setStatus("idle");
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const credentials = readLoginCredentials(event.currentTarget);
      const parsedEmail = emailSchema.safeParse(credentials.email);
      if (!parsedEmail.success) {
        setError(parsedEmail.error.issues[0]?.message ?? "Enter a valid work email address.");
        return;
      }
      if (!credentials.password.trim()) {
        setError("Enter your password.");
        return;
      }

      const account = findAccount(parsedEmail.data);
      if (!account) {
        setError("No account found on this device for this email. Create an account first.");
        return;
      }
      const passwordHash = await hashPassword(credentials.password, parsedEmail.data);
      if (passwordHash !== account.passwordHash) {
        setError("That password does not match this account.");
        return;
      }

      setError(null);
      setNotice(null);
      try {
        if (credentials.rememberWorkstation) {
          window.localStorage.setItem(rememberedEmailKey, parsedEmail.data);
        } else {
          window.localStorage.removeItem(rememberedEmailKey);
        }
      } catch {
        // Ignore storage errors when remembering email
      }
      enterWorkspace({ name: account.name, email: account.email });
    } catch {
      setStatus("idle");
      setError("Unable to sign in on this browser. Please check storage and cookie settings and try again.");
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const data = new FormData(event.currentTarget);
      const parsedName = nameSchema.safeParse(String(data.get("full-name") ?? ""));
      const parsedEmail = emailSchema.safeParse(String(data.get("email") ?? ""));
      const parsedPassword = passwordSchema.safeParse(String(data.get("password") ?? ""));
      const confirm = String(data.get("confirm-password") ?? "");
      if (!parsedName.success) {
        setError(parsedName.error.issues[0]?.message ?? "Enter the account holder's name.");
        return;
      }
      if (!parsedEmail.success) {
        setError(parsedEmail.error.issues[0]?.message ?? "Enter a valid work email address.");
        return;
      }
      if (!parsedPassword.success) {
        setError(parsedPassword.error.issues[0]?.message ?? "Use at least 8 characters for the password.");
        return;
      }
      if (confirm !== parsedPassword.data) {
        setError("Passwords do not match.");
        return;
      }
      if (findAccount(parsedEmail.data)) {
        setError("An account with this email already exists. Sign in instead.");
        return;
      }

      const passwordHash = await hashPassword(parsedPassword.data, parsedEmail.data);
      const user = { name: parsedName.data, email: parsedEmail.data.toLowerCase() };
      saveAccount({ ...user, passwordHash });
      try {
        window.localStorage.setItem(rememberedEmailKey, user.email);
      } catch {
        // Ignore storage errors when remembering email
      }
      setError(null);
      enterWorkspace(user);
    } catch {
      setStatus("idle");
      setError("Unable to create the account in this browser. Ensure cookies and local storage are enabled.");
    }
  }

  function handleForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEmail = String(new FormData(event.currentTarget).get("reset-email") ?? "");
    const parsed = emailSchema.safeParse(formEmail);
    if (!parsed.success) {
      setNotice("Enter the work email that should receive reset instructions.");
      return;
    }
    setNotice("Password reset email is not connected yet. Sign in with your work email on this screen.");
    setForgotOpen(false);
  }

  function handleProvider(provider: "Microsoft" | "Google") {
    setNotice(`${provider} sign-in is not connected for this workspace.`);
  }

  const busy = status !== "idle";

  return (
    <section
      className={`login-card relative mx-auto w-full max-w-[420px] rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-[0_30px_80px_-24px_rgba(16,35,58,0.55)] ring-1 ring-[#1D9E75]/25 backdrop-blur-xl ${
        status === "leaving" ? "login-card-leave" : ""
      }`}
    >
      <div className="mb-3 text-center">
        <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-xl bg-[#1D9E75] text-white shadow-[0_10px_24px_-12px_#1D9E75]">
          <Plus className="h-4 w-4" aria-hidden="true" />
        </div>
        <p className="text-base font-semibold tracking-tight text-ink">PharmaCare</p>
        <p className="text-[11px] font-medium tracking-wide text-muted uppercase">Pharmacy Management System</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{mode === "sign-in" ? "Welcome Back!" : "Create account"}</h1>
        <p className="text-sm text-muted">{mode === "sign-in" ? "Smart Pharmacy. Better Care." : "Save an account on this browser, then open the dashboard."}</p>
      </div>

      {mode === "create" ? (
        <form className="space-y-2.5" onSubmit={handleCreate} noValidate>
          <AccountField icon={UserRound} id="full-name" label="Full name" name="full-name" placeholder="Kinjal Chamadiya" type="text" />
          <AccountField icon={Mail} id="create-email" label="Work Email Address" name="email" placeholder="pharmacist@carecenter.com" type="email" />
          <PasswordField id="create-password" label="Password" name="password" placeholder="At least 8 characters" />
          <PasswordField id="confirm-password" label="Confirm password" name="confirm-password" placeholder="Repeat the password" />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <SubmitButton busy={busy} idleLabel="Create account" pendingLabel="Creating account" />
          <p className="text-center text-sm text-ink">
            Already have an account?{" "}
            <button className="font-semibold text-[#178666] hover:text-[#10233A]" onClick={() => openMode("sign-in")} type="button">
              Sign in
            </button>
          </p>
        </form>
      ) : (
      <form className="space-y-2.5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-wide text-ink/80 uppercase" htmlFor="email-address">
            Work Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              className={fieldClassName}
              id="email-address"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="pharmacist@carecenter.com"
              spellCheck={false}
              type="email"
              value={emailValue}
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

        <div className="flex items-center justify-between gap-3 pt-1">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              checked={remember}
              className="h-4 w-4 rounded border-line text-[#1D9E75] focus:ring-[#1D9E75]/30"
              name="remember-me"
              onChange={(event) => setRememberChoice(event.target.checked)}
              type="checkbox"
            />
            Remember This Device
          </label>
          <button
            className="text-sm font-semibold text-[#178666] hover:text-[#10233A]"
            onClick={() => setForgotOpen((open) => !open)}
            type="button"
          >
            Forgot Password?
          </button>
        </div>

        <SubmitButton busy={busy} idleLabel="Sign In" pendingLabel="Signing in" />
      </form>
      )}

      {mode === "sign-in" && forgotOpen ? (
        <form className="mt-4 space-y-2 rounded-2xl border border-[#1D9E75]/20 bg-[#E7F6F1]/80 p-3" onSubmit={handleForgot}>
          <label className="text-xs font-semibold text-ink" htmlFor="reset-email">
            Work email for password help
          </label>
          <input
            className="h-10 w-full rounded-lg border border-white bg-white px-3 text-sm focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/15 focus:outline-none"
            defaultValue={emailValue}
            id="reset-email"
            name="reset-email"
            type="email"
          />
          <button className="text-sm font-semibold text-[#178666]" type="submit">
            Continue
          </button>
        </form>
      ) : null}

      {mode === "sign-in" ? (
      <>
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-navy/10" />
        </div>
        <p className="relative mx-auto w-fit bg-white/70 px-3 text-[11px] font-semibold tracking-wide text-muted uppercase">
          Or continue with
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          className="flex h-9 items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/80 text-sm font-medium text-ink transition hover:border-[#1D9E75]/40"
          onClick={() => handleProvider("Microsoft")}
          type="button"
        >
          <MicrosoftMark />
          Microsoft
        </button>
        <button
          className="flex h-9 items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/80 text-sm font-medium text-ink transition hover:border-[#1D9E75]/40"
          onClick={() => handleProvider("Google")}
          type="button"
        >
          <GoogleMark />
          Google
        </button>
      </div>

        <p className="mt-3 text-center text-sm text-ink">
          New to PharmaCare?{" "}
          <button className="font-semibold text-[#178666] hover:text-[#10233A]" onClick={() => openMode("create")} type="button">
            Create account
          </button>
        </p>
      </>
      ) : null}

      {notice ? <p className="mt-3 text-center text-sm text-ink">{notice}</p> : null}

      <p className="mt-3 text-center text-xs text-muted">Secure & Compliant Pharmacy Platform.</p>
    </section>
  );
}

function AccountField({
  icon: Icon,
  id,
  label,
  name,
  placeholder,
  type,
}: {
  icon: LucideIcon;
  id: string;
  label: string;
  name: string;
  placeholder: string;
  type: "text" | "email";
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold tracking-wide text-ink/80 uppercase" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          autoCapitalize={type === "email" ? "none" : "words"}
          autoComplete={type === "email" ? "email" : "name"}
          autoCorrect="off"
          className={fieldClassName}
          id={id}
          name={name}
          placeholder={placeholder}
          spellCheck={false}
          type={type}
        />
      </div>
    </div>
  );
}

function PasswordField({ id, label, name, placeholder }: { id: string; label: string; name: string; placeholder: string }) {
  const password = usePasswordVisibility();
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold tracking-wide text-ink/80 uppercase" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
        <input autoComplete="new-password" className={`${fieldClassName} pr-11`} id={id} name={name} placeholder={placeholder} type={password.inputType} />
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
  );
}

function SubmitButton({ busy, idleLabel, pendingLabel }: { busy: boolean; idleLabel: string; pendingLabel: string }) {
  return (
    <button
      className="group flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1D9E75] to-[#1A6F8A] px-4 text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgba(26,111,138,0.9)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-12px_rgba(26,111,138,0.85)] focus:ring-4 focus:ring-[#1D9E75]/30 focus:outline-none active:translate-y-0 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
      disabled={busy}
      type="submit"
    >
      {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      <span>{busy ? pendingLabel : idleLabel}</span>
      {busy ? null : <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
    </button>
  );
}
