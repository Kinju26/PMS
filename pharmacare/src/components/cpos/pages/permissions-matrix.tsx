"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw, Search, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, Section, Select } from "@/components/cpos/fields";
import { PERMISSION_CATALOG } from "@/lib/cpos/constants";
import { useCpos } from "@/lib/cpos/store";
import { cn } from "@/lib/utils";
import type { PermissionDomain, PermissionKey } from "@/types/cpos";

type DomainFilter = "all" | PermissionDomain;

const shortRoleLabel: Record<string, string> = {
  "Pharmacy Owner": "Owner",
  "Pharmacy Manager": "Manager",
  Pharmacist: "Pharmacist",
  "Pharmacy Technician": "Technician",
  "Pharmacy Assistant": "Assistant",
  "Data-entry Staff": "Data-entry",
  "Inventory Manager": "Inventory",
  "Delivery Staff": "Delivery",
  "System Administrator": "Sys Admin",
  Auditor: "Auditor",
};

export function PermissionsMatrix() {
  const { state, saveRolePermissions, resetRolePermissions } = useCpos();
  const [query, setQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState<DomainFilter>("all");
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const [focusedRoleId, setFocusedRoleId] = useState<string>("all");

  const filteredPermissions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PERMISSION_CATALOG.filter((perm) => {
      const matchesDomain = domainFilter === "all" || perm.domain === domainFilter;
      const matchesRisk = !highRiskOnly || perm.highRisk;
      const matchesQuery =
        !q ||
        perm.label.toLowerCase().includes(q) ||
        perm.description.toLowerCase().includes(q) ||
        perm.domain.toLowerCase().includes(q);
      return matchesDomain && matchesRisk && matchesQuery;
    });
  }, [domainFilter, highRiskOnly, query]);

  const visibleRoles = useMemo(() => {
    if (focusedRoleId === "all") return state.roles;
    return state.roles.filter((role) => role.id === focusedRoleId);
  }, [focusedRoleId, state.roles]);

  function togglePermission(roleId: string, permKey: PermissionKey) {
    const role = state.roles.find((item) => item.id === roleId);
    if (!role) return;
    const exists = role.permissions.includes(permKey);
    const next = exists
      ? role.permissions.filter((key) => key !== permKey)
      : [...role.permissions, permKey];
    saveRolePermissions(roleId, next);
  }

  const totalHighRisk = PERMISSION_CATALOG.filter((p) => p.highRisk).length;

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader
        eyebrow="Phase 0 · User & Access Management"
        title="Role & Permission Matrix"
        description="Granular Canadian pharmacy RBAC matrix across all 16 clinical, dispensing, billing, inventory, and audit permission categories. High-risk controls are visually highlighted."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="secondary">
              <Link href="/access/roles">Manage Roles</Link>
            </Button>
            <Button type="button" variant="secondary" onClick={resetRolePermissions}>
              <RotateCcw className="h-4 w-4" />
              Reset defaults
            </Button>
          </div>
        }
      />

      {/* High-Risk Governance Callout */}
      <div className="flex flex-col gap-3 rounded-xl border border-red-200/80 bg-red-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-100 text-red-700">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div className="text-xs text-red-950">
            <p className="font-semibold">
              {totalHighRisk} of {PERMISSION_CATALOG.length} permissions are classified as High-Risk Regulated Controls
            </p>
            <p className="mt-0.5 text-red-900/80">
              Clinical verification, DUR override, prescription modification, dispensing, final verification, claim submission/reversal, data export, and audit log access must be enforced server-side when backend RBAC is connected.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setHighRiskOnly((prev) => !prev)}
          aria-pressed={highRiskOnly}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition",
            highRiskOnly
              ? "border-red-700 bg-red-700 text-white"
              : "border-red-200 bg-white text-red-700 hover:bg-red-100/60",
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          {highRiskOnly ? "Showing High-Risk Only" : "Filter High-Risk Only"}
        </button>
      </div>

      {/* Controls & Matrix */}
      <Section
        title="Role-to-Permission Matrix"
        description="Click any checkbox to simulate permission changes for this session. Every toggle records an entry in Audit Logs."
      >
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search permissions..."
                aria-label="Search permissions"
                className="h-10 w-full rounded-lg border border-line bg-white pr-8 pl-9 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <Select
              value={focusedRoleId}
              onChange={(event) => setFocusedRoleId(event.target.value)}
              aria-label="Focus single role"
              className="w-full sm:w-52"
            >
              <option value="all">Compare all roles ({state.roles.length})</option>
              {state.roles.map((role) => (
                <option key={role.id} value={role.id}>
                  Focus: {role.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by permission domain">
            {(
              [
                ["all", "All Domains"],
                ["Patient & Clinical", "Patient & Clinical"],
                ["Dispensing & Billing", "Dispensing & Billing"],
                ["Inventory & Operations", "Inventory"],
                ["Reporting & Governance", "Governance"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setDomainFilter(id)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                  domainFilter === id
                    ? "bg-[#10233a] text-white"
                    : "bg-[#F4F8FB] text-muted hover:bg-[#E6EEF2] hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Matrix Table with Sticky Permission Column */}
        <div className="overflow-x-auto rounded-xl border border-[#E6EEF2]">
          <table className="w-full min-w-[920px] border-collapse text-left text-xs">
            <thead className="bg-[#F8FBFD] text-[11px] font-semibold text-muted">
              <tr className="border-b border-[#E6EEF2]">
                <th className="sticky left-0 z-10 min-w-[260px] border-r border-[#E6EEF2] bg-[#F8FBFD] px-4 py-3 uppercase">
                  Permission Category ({filteredPermissions.length})
                </th>
                {visibleRoles.map((role) => (
                  <th
                    key={role.id}
                    className="min-w-[82px] px-2 py-3 text-center"
                    title={role.name}
                  >
                    <span className="block font-semibold text-ink">
                      {shortRoleLabel[role.name] ?? role.name}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-normal text-muted">
                      {role.permissions.length}/16
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF3F6] bg-white">
              {filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={visibleRoles.length + 1} className="px-4 py-10 text-center text-muted">
                    No permissions match your current filters.
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((perm) => (
                  <tr
                    key={perm.key}
                    className={cn(
                      "transition-colors",
                      perm.highRisk
                        ? "bg-red-50/35 hover:bg-red-50/60"
                        : "hover:bg-[#F8FBFD]",
                    )}
                  >
                    <td
                      className={cn(
                        "sticky left-0 z-10 border-r border-[#E6EEF2] px-4 py-3 align-top",
                        perm.highRisk ? "bg-[#FFF7F7]" : "bg-white",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-ink">{perm.label}</span>
                        {perm.highRisk ? (
                          <Badge tone="danger" className="gap-1 rounded-full px-1.5 py-0 text-[10px]">
                            <ShieldAlert className="h-2.5 w-2.5" />
                            High Risk
                          </Badge>
                        ) : (
                          <Badge tone="neutral" className="rounded-full px-1.5 py-0 text-[10px]">
                            Standard
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted">
                        {perm.description}
                      </p>
                      {perm.highRisk && perm.riskReason ? (
                        <p className="mt-1 text-[10px] font-medium text-red-700/90">
                          Control note: {perm.riskReason}
                        </p>
                      ) : null}
                    </td>

                    {visibleRoles.map((role) => {
                      const granted = role.permissions.includes(perm.key);
                      return (
                        <td key={`${role.id}-${perm.key}`} className="px-2 py-3 text-center align-middle">
                          <label className="inline-flex cursor-pointer items-center justify-center p-1.5">
                            <input
                              type="checkbox"
                              checked={granted}
                              onChange={() => togglePermission(role.id, perm.key)}
                              aria-label={`${role.name} — ${perm.label}`}
                              className={cn(
                                "form-checkbox h-4 w-4 rounded transition focus:ring-2",
                                perm.highRisk
                                  ? "border-red-300 text-red-600 focus:ring-red-500/30"
                                  : "border-line text-[#1D9E75] focus:ring-[#1D9E75]/30",
                              )}
                            />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Matrix Footer Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#1D9E75]" />
              Standard operational permission
            </span>
            <span className="inline-flex items-center gap-1.5 text-red-700">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              High-risk clinical, billing, export, or audit permission
            </span>
          </div>
          <span>Changes apply to this browser session and log to Audit Logs.</span>
        </div>
      </Section>
    </div>
  );
}

