import type { ReactNode, SelectHTMLAttributes } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="inline-flex items-center gap-1 text-xs font-semibold text-ink">
        {label}
        {required ? (
          <span className="text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-teal-brand focus:ring-2 focus:ring-teal-brand/20 disabled:bg-canvas disabled:text-muted",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Section({
  title,
  description,
  children,
  action,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-[#DCE3EA] bg-white", className)}>
      <div className="flex flex-col gap-3 border-b border-[#E6ECF1] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description ? <p className="mt-0.5 max-w-2xl text-xs text-muted">{description}</p> : null}
        </div>
        {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  status,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  status?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-[#DCE3EA] pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold tracking-wider text-[#087f8c] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <div className="mt-1 flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h1>
          {status}
        </div>
        <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-9 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs text-muted">{body}</p>
    </div>
  );
}
