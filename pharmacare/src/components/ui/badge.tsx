import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-canvas text-ink",
  brand: "bg-brand-soft text-brand-hover",
  success: "bg-emerald-50 text-emerald-800",
  warning: "bg-amber-50 text-amber-800",
  danger: "bg-red-50 text-red-800",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", tones[tone], className)}
      {...props}
    />
  );
}
