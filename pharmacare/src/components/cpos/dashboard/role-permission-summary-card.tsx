"use client";

import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PERMISSION_CATALOG } from "@/lib/cpos/constants";
import { useCpos } from "@/lib/cpos/store";
import { cn } from "@/lib/utils";

export function RolePermissionSummaryCard({ className }: { className?: string }) {
  const { state } = useCpos();
  const highRiskSet = new Set(
    PERMISSION_CATALOG.filter((p) => p.highRisk).map((p) => p.key),
  );

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col rounded-2xl border border-[#E6EEF2] bg-white p-5",
        className,
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Role &amp; Permission Summary</h2>
          <p className="mt-0.5 text-xs text-muted">
            {state.roles.length} Canadian pharmacy roles mapped across {PERMISSION_CATALOG.length}{" "}
            access controls ({highRiskSet.size} high-risk)
          </p>
        </div>
        <Link
          href="/access/permissions"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#1D9E75] hover:text-[#178666]"
        >
          Open Matrix
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[#EEF3F6]">
        <table className="w-full min-w-[480px] text-left text-xs">
          <thead className="bg-[#F8FBFD] text-[11px] font-semibold tracking-wide text-muted uppercase">
            <tr>
              <th className="px-3.5 py-2.5">Role</th>
              <th className="px-3 py-2.5">Scope</th>
              <th className="px-3 py-2.5 text-right">Users</th>
              <th className="px-3 py-2.5 text-right">Permissions</th>
              <th className="px-3.5 py-2.5 text-right">High-Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF3F6] bg-white">
            {state.roles.map((role) => {
              const userCount = state.users.filter((u) => u.role === role.name).length;
              const highRiskCount = role.permissions.filter((p) => highRiskSet.has(p)).length;
              return (
                <tr key={role.id} className="transition-colors hover:bg-[#F8FBFD]">
                  <td className="px-3.5 py-2.5 font-semibold text-ink">{role.name}</td>
                  <td className="px-3 py-2.5 text-muted">{role.scope}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-ink tabular-nums">
                    {userCount}
                  </td>
                  <td className="px-3 py-2.5 text-right text-muted tabular-nums">
                    {role.permissions.length} / {PERMISSION_CATALOG.length}
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    {highRiskCount > 0 ? (
                      <Badge tone="danger" className="gap-1 rounded-full text-[10px]">
                        <ShieldAlert className="h-2.5 w-2.5" />
                        {highRiskCount}
                      </Badge>
                    ) : (
                      <Badge tone="neutral" className="rounded-full text-[10px]">
                        0
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

