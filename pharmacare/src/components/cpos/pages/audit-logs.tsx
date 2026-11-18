"use client";

import { Info, ScrollText, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/cpos/data-table";
import { PageHeader, Section, Select } from "@/components/cpos/fields";
import { useCpos } from "@/lib/cpos/store";

export function AuditLogsPageView() {
  const { state } = useCpos();
  const [moduleFilter, setModuleFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState<"all" | "standard" | "high-risk">("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "session" | "demo">("all");

  const modules = useMemo(
    () => Array.from(new Set(state.auditLogs.map((entry) => entry.module))).sort(),
    [state.auditLogs],
  );

  const filtered = useMemo(() => {
    return state.auditLogs.filter((entry) => {
      const matchesModule = moduleFilter === "all" || entry.module === moduleFilter;
      const matchesRisk = riskFilter === "all" || entry.risk === riskFilter;
      const matchesSource = sourceFilter === "all" || entry.source === sourceFilter;
      return matchesModule && matchesRisk && matchesSource;
    });
  }, [moduleFilter, riskFilter, sourceFilter, state.auditLogs]);

  const sessionEventsCount = state.auditLogs.filter((e) => e.source === "session").length;
  const highRiskCount = state.auditLogs.filter((e) => e.risk === "high-risk").length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        eyebrow="Phase 0 · Governance & Compliance"
        title="Audit Logs"
        description="Track Phase 0 pharmacy configuration updates, user access changes, and high-risk permission edits. Any change you make in this session appears immediately below."
      />

      {/* Compliance note */}
      <div className="flex items-start gap-3 rounded-xl border border-[#DCEAEF] bg-[#F4F9FB] px-4 py-3 text-xs text-ink">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#087f8c]" />
        <p>
          <span className="font-semibold">Frontend Session Log Preview:</span> Immutable, tamper-evident audit storage (with IP, device fingerprint, and provincial college retention compliance) will be implemented by the backend team. Entries tagged <span className="font-semibold">Session</span> reflect edits made right now; entries tagged <span className="font-semibold">Demo baseline</span> illustrate the expected record structure.
        </p>
      </div>

      {/* Summary metrics */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <div>
            <p className="text-xs font-medium text-muted">Total Logged Events</p>
            <p className="mt-1 text-2xl font-bold text-ink tabular-nums">{state.auditLogs.length}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-light text-[#087f8c]">
            <ScrollText className="h-5 w-5" />
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <div>
            <p className="text-xs font-medium text-muted">Live Session Edits</p>
            <p className="mt-1 text-2xl font-bold text-[#1D9E75] tabular-nums">
              {sessionEventsCount}
            </p>
          </div>
          <Badge tone="success" className="rounded-full">
            Captured in session
          </Badge>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <div>
            <p className="text-xs font-medium text-muted">High-Risk Access Events</p>
            <p className="mt-1 text-2xl font-bold text-ink tabular-nums">{highRiskCount}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600">
            <ShieldAlert className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Audit Table */}
      <Section title="Administrative Configuration Trail">
        <DataTable
          rows={filtered}
          pageSize={8}
          searchPlaceholder="Search action, actor, module, or detail..."
          getSearchText={(row) => `${row.action} ${row.actor} ${row.module} ${row.detail}`}
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={moduleFilter}
                onChange={(event) => setModuleFilter(event.target.value)}
                aria-label="Filter by module"
                className="h-10 w-full sm:w-44"
              >
                <option value="all">All modules</option>
                {modules.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </Select>
              <Select
                value={riskFilter}
                onChange={(event) =>
                  setRiskFilter(event.target.value as "all" | "standard" | "high-risk")
                }
                aria-label="Filter by risk"
                className="h-10 w-full sm:w-36"
              >
                <option value="all">All risk levels</option>
                <option value="high-risk">High Risk</option>
                <option value="standard">Standard</option>
              </Select>
              <Select
                value={sourceFilter}
                onChange={(event) =>
                  setSourceFilter(event.target.value as "all" | "session" | "demo")
                }
                aria-label="Filter by source"
                className="h-10 w-full sm:w-36"
              >
                <option value="all">All sources</option>
                <option value="session">Session</option>
                <option value="demo">Demo baseline</option>
              </Select>
            </div>
          }
          columns={[
            {
              key: "timestamp",
              header: "Timestamp",
              cell: (row) => (
                <span className="whitespace-nowrap font-mono text-xs text-muted tabular-nums">
                  {row.timestamp}
                </span>
              ),
            },
            {
              key: "module",
              header: "Module",
              cell: (row) => (
                <Badge tone="brand" className="rounded-full whitespace-nowrap">
                  {row.module}
                </Badge>
              ),
            },
            {
              key: "action",
              header: "Action & Detail",
              cell: (row) => (
                <div>
                  <p className="font-semibold text-ink">{row.action}</p>
                  <p className="mt-0.5 text-xs text-muted">{row.detail}</p>
                </div>
              ),
            },
            { key: "actor", header: "Actor", cell: (row) => <span className="font-medium">{row.actor}</span> },
            {
              key: "risk",
              header: "Classification",
              cell: (row) => (
                <div className="flex flex-wrap gap-1">
                  <Badge
                    tone={row.risk === "high-risk" ? "danger" : "neutral"}
                    className="rounded-full"
                  >
                    {row.risk === "high-risk" ? "High Risk" : "Standard"}
                  </Badge>
                  <Badge
                    tone={row.source === "session" ? "success" : "neutral"}
                    className="rounded-full"
                  >
                    {row.source === "session" ? "Session" : "Demo"}
                  </Badge>
                </div>
              ),
            },
          ]}
        />
      </Section>
    </div>
  );
}

