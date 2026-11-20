"use client";

import { LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { changePasswordAction } from "@/lib/auth/actions";
import { MIN_NEW_PASSWORD_LENGTH } from "@/lib/auth/constants";
import { usePasswordVisibility } from "@/hooks/usePasswordVisibility";

const fieldClassName =
  "block min-h-[42px] w-full rounded-[9px] border border-[#e2eaf0] bg-white px-3 py-[11px] text-sm text-[#183247] outline-none placeholder:text-[#9aa7b1] focus:border-[#168b83] focus:shadow-[0_0_0_3px_#168b8317]";

export function ChangePasswordForm({ forced }: { forced: boolean }) {
  const current = usePasswordVisibility();
  const next = usePasswordVisibility();
  const confirm = usePasswordVisibility();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const newPassword = String(data.get("newPassword") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    setError(null);
    setStatus("loading");
    try {
      const result = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (!result.ok) {
        setError(result.message ?? "Unable to update password right now.");
        setStatus("idle");
        return;
      }
      window.location.assign(result.redirectTo ?? "/dashboard");
    } catch {
      setError("Unable to update password right now.");
      setStatus("idle");
    }
  }

  const busy = status === "loading";

  return (
    <form className="max-w-md space-y-4" method="post" onSubmit={handleSubmit}>
      {forced ? (
        <p className="rounded-lg bg-[#fff8e8] px-3 py-2 text-xs text-[#94620e]">
          For security, you must set a new Super Admin password before using the dashboard.
        </p>
      ) : null}

      <div>
        <label className="mb-[7px] block text-xs font-bold text-[#344e62]" htmlFor="currentPassword">
          Current password
        </label>
        <div className="relative">
          <input
            autoComplete="current-password"
            className={`${fieldClassName} pr-16`}
            id="currentPassword"
            name="currentPassword"
            required
            type={current.inputType}
          />
          <button
            className="absolute top-[7px] right-2 text-[11px] font-extrabold tracking-wide text-[#168b83] uppercase"
            onClick={current.toggle}
            type="button"
          >
            {current.visible ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-[7px] block text-xs font-bold text-[#344e62]" htmlFor="newPassword">
          New password
        </label>
        <div className="relative">
          <input
            autoComplete="new-password"
            className={`${fieldClassName} pr-16`}
            id="newPassword"
            minLength={MIN_NEW_PASSWORD_LENGTH}
            name="newPassword"
            required
            type={next.inputType}
          />
          <button
            className="absolute top-[7px] right-2 text-[11px] font-extrabold tracking-wide text-[#168b83] uppercase"
            onClick={next.toggle}
            type="button"
          >
            {next.visible ? "Hide" : "Show"}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-[#718394]">
          Use at least {MIN_NEW_PASSWORD_LENGTH} characters. Do not reuse the default password.
        </p>
      </div>

      <div>
        <label className="mb-[7px] block text-xs font-bold text-[#344e62]" htmlFor="confirmPassword">
          Confirm new password
        </label>
        <div className="relative">
          <input
            autoComplete="new-password"
            className={`${fieldClassName} pr-16`}
            id="confirmPassword"
            name="confirmPassword"
            required
            type={confirm.inputType}
          />
          <button
            className="absolute top-[7px] right-2 text-[11px] font-extrabold tracking-wide text-[#168b83] uppercase"
            onClick={confirm.toggle}
            type="button"
          >
            {confirm.visible ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg bg-[#fff0ef] px-2.5 py-2.5 text-xs text-[#a52e28]" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="w-full rounded-[9px] bg-[#102a43] px-[15px] py-[13px] text-xs font-bold text-white shadow-[0_5px_13px_#102a4320] transition hover:-translate-y-px hover:bg-[#173e5d] disabled:opacity-80 sm:w-auto"
        disabled={busy}
        type="submit"
      >
        <span className="inline-flex items-center justify-center gap-2">
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {busy ? "Saving" : "Update password"}
        </span>
      </button>
    </form>
  );
}
