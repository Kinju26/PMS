"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { loginAction } from "@/lib/auth/actions";
import { GENERIC_AUTH_ERROR } from "@/lib/auth/constants";
import { usePasswordVisibility } from "@/hooks/usePasswordVisibility";

const identifierSchema = z.string().trim().min(3, "Invalid User ID or Password. Please try again.");
const passwordSchema = z.string().min(1, "Invalid User ID or Password. Please try again.");
const mfaSchema = z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code.");

const fieldClassName =
  "control block min-h-[42px] w-full rounded-[9px] border border-[#e2eaf0] bg-white px-3 py-[11px] text-sm text-[#183247] outline-none placeholder:text-[#9aa7b1] focus:border-[#168b83] focus:shadow-[0_0_0_3px_#168b8317]";

export function LoginForm() {
  const password = usePasswordVisibility();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const identifier = String(data.get("identifier") ?? "");
    const passwordValue = String(data.get("password") ?? "");
    const mfaCode = String(data.get("mfa-code") ?? "");

    if (!mfaRequired) {
      const parsedId = identifierSchema.safeParse(identifier);
      if (!parsedId.success) {
        setError("Invalid User ID or Password. Please try again.");
        return;
      }
      const parsedPassword = passwordSchema.safeParse(passwordValue);
      if (!parsedPassword.success) {
        setError("Invalid User ID or Password. Please try again.");
        return;
      }
    } else {
      const parsedMfa = mfaSchema.safeParse(mfaCode);
      if (!parsedMfa.success) {
        setError(parsedMfa.error.issues[0]?.message ?? "Enter the 6-digit verification code.");
        return;
      }
    }

    setError(null);
    setStatus("loading");
    try {
      const result = await loginAction({
        identifier,
        password: passwordValue,
        rememberMe,
        mfaCode: mfaRequired ? mfaCode : undefined,
      });
      if (result.mfaRequired) {
        setMfaRequired(true);
        setError(result.message ?? "Enter the verification code from your authenticator app.");
        setStatus("idle");
        return;
      }
      if (!result.ok) {
        setError(
          result.message === GENERIC_AUTH_ERROR
            ? "Invalid User ID or Password. Please try again."
            : (result.message ?? "Invalid User ID or Password. Please try again."),
        );
        setStatus("idle");
        return;
      }
      window.location.assign(result.redirectTo ?? "/home");
    } catch {
      setError("Unable to sign in right now. Please try again.");
      setStatus("idle");
    }
  }

  const busy = status === "loading";

  return (
    <div className="w-full">
      <div className="mt-[10px]">
        <p className="text-[11px] font-extrabold tracking-[0.15em] text-[#168b83] uppercase">Welcome back</p>
        <h2 className="mt-2.5 text-[29px] leading-none font-bold tracking-[-0.04em] text-[#102a43]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-xs text-[#718394]">Use your administrator credentials to continue.</p>
      </div>

      <form className="mt-4" method="post" action="/" onSubmit={handleSubmit} noValidate>
        <div className="mt-[17px]">
          <label className="mb-[7px] block text-xs font-bold text-[#344e62]" htmlFor="identifier">
            User ID
          </label>
          <input
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect="off"
            className={fieldClassName}
            id="identifier"
            name="identifier"
            placeholder="Enter User ID"
            spellCheck={false}
            type="text"
          />
        </div>

        <div className="mt-[17px]">
          <label className="mb-[7px] block text-xs font-bold text-[#344e62]" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              autoComplete="current-password"
              className={`${fieldClassName} pr-16`}
              id="password"
              name="password"
              placeholder="Enter password"
              type={password.inputType}
            />
            <button
              className="absolute top-[7px] right-2 border-0 bg-transparent px-[7px] py-[7px] text-[11px] font-extrabold tracking-wide text-[#168b83] uppercase"
              onClick={password.toggle}
              type="button"
            >
              {password.visible ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {mfaRequired ? (
          <div className="mt-[17px]">
            <label className="mb-[7px] block text-xs font-bold text-[#344e62]" htmlFor="mfa-code">
              Authenticator code
            </label>
            <input
              autoComplete="one-time-code"
              className={fieldClassName}
              id="mfa-code"
              inputMode="numeric"
              name="mfa-code"
              placeholder="6-digit code"
            />
          </div>
        ) : null}

        <div className="mt-2.5 mb-[19px] flex items-center justify-between text-[11px] text-[#718394]">
          <label className="flex items-center gap-[7px]">
            <input
              checked={rememberMe}
              className="h-3.5 w-3.5 rounded border-[#e2eaf0] text-[#168b83] focus:ring-[#168b83]/30"
              onChange={(event) => setRememberMe(event.target.checked)}
              type="checkbox"
            />
            Remember me
          </label>
          <Link className="text-[#168b83] hover:underline" href="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <button
          className="w-full rounded-[9px] bg-[#102a43] px-[15px] py-[13px] text-xs font-bold text-white shadow-[0_5px_13px_#102a4320] transition hover:-translate-y-px hover:bg-[#173e5d] focus:ring-4 focus:ring-[#102a43]/20 focus:outline-none disabled:cursor-wait disabled:opacity-80"
          disabled={busy}
          type="submit"
        >
          <span className="inline-flex items-center justify-center gap-2">
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {busy ? "Signing in" : "Sign In to Master Admin"}
          </span>
        </button>

        {error ? (
          <p className="mt-3 rounded-lg bg-[#fff0ef] px-2.5 py-2.5 text-xs text-[#a52e28]" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
