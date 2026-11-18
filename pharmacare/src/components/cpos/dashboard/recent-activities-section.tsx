"use client";

import Link from "next/link";
import { ArrowRight, ScrollText, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useCpos } from "@/lib/cpos/store";
import { cn } from "@/lib/utils";

export function RecentActivitiesSection({ className }: { className?: string }) {
  const { state } = useCpos();
  const [filter, setFilter] = useState<"all" | "session" | "high-risk">("all");

  const items = useMemo(() => {
    const filtered = state.auditLogs.filter((entry) => {
      if (filter === "session") return entry.source === "session";
      if (filter === "high-risk") return entry.risk === "high-risk";
      return true;
    });
    return filtered.slice(0, 6);
  }, [filter, state.auditLogs]);

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col rounded-2xl border border-[#E6EEF2] bg-white p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-ink">Recent Administrative Activities</h2>
          <p className="mt-0.5 text-xs text-muted">
            Live session configuration changes &amp; demo baseline audit entries
          </p>
        </div>
        <Link
          href="/audit-logs"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#1D9E75] hover:text-[#178666]"
        >
          Audit Logs
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter recent activities">
        {(
          [
            ["all", "All"],
            ["session", "Session Edits"],
            ["high-risk", "High-Risk Access"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition",
              filter === id
                ? "bg-[#10233a] text-white"
                : "bg-[#F4F8FB] text-muted hover:bg-[#E6EEF2] hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-line px-4 py-8 text-center text-xs text-muted">
          No session edits recorded yet. Save any Phase 0 configuration screen to see live audit activity here.
        </div>
      ) : (
        <ol className="mt-4 flex-1 divide-y divide-[#F1F5F8]">
          {items.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3 py-3 first:pt-1 last:pb-0">
              <span
                className={cn(
                  "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                  entry.risk === "high-risk"
                    ? "bg-red-50 text-red-600"
                    : "bg-[#E7F6F1] text-[#1D9E75]",
                )}
              >
                {entry.risk === "high-risk" ? (
                  <ShieldAlert className="h-4 w-4" />
                ) : (
                  <ScrollText className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-ink">{entry.action}</p>
                  <span className="shrink-0 font-mono text-[10px] text-muted">{entry.timestamp}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{entry.detail}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge tone="brand" className="rounded-full text-[10px]">
                    {entry.module}
                  </Badge>
                  <Badge
                    tone={entry.source === "session" ? "success" : "neutral"}
                    className="rounded-full text-[10px]"
                  >
                    {entry.source === "session" ? "Session" : "Demo baseline"}
                  </Badge>
                  <span className="text-[11px] text-muted">· {entry.actor}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
