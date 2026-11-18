"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { useCpos } from "@/lib/cpos/store";
import { cn } from "@/lib/utils";

type ConfigModuleRow = {
  id: string;
  label: string;
  href: string;
  status: "configured" | "pending-backend" | "attention";
  detail: string;
};

export function ConfigurationStatusCard({ className }: { className?: string }) {
  const { state } = useCpos();

  const modules: ConfigModuleRow[] = [
    {
      id: "profile",
      label: "Pharmacy Profile",
      href: "/configuration/pharmacy",
      status:
        state.pharmacy.legalName && state.pharmacy.regulatoryId && state.contact.postalCode
          ? "configured"
          : "attention",
      detail: `${state.pharmacy.operatingName} · ${state.contact.city}, ${state.contact.province}`,
    },
    {
      id: "hours",
      label: "Operating Hours",
      href: "/configuration/hours",
      status: state.hours.some((h) => h.open) ? "configured" : "attention",
      detail: `${state.hours.filter((h) => h.open).length} open days · ${state.specialHours.length} special overrides`,
    },
    {
      id: "holidays",
      label: "Holiday Management",
      href: "/configuration/holidays",
      status: state.holidays.length > 0 ? "configured" : "attention",
      detail: `${state.holidays.length} upcoming holiday dates configured`,
    },
    {
      id: "locations",
      label: "Location Configuration",
      href: "/locations",
      status: state.locations.length > 0 ? "configured" : "attention",
      detail:
        state.locations.length === 1
          ? `Single-location active (${state.locations[0]?.code})`
          : `${state.locations.length} locations configured`,
    },
    {
      id: "delivery",
      label: "Delivery Settings",
      href: "/configuration/delivery",
      status: "pending-backend",
      detail: `${state.delivery.zones.length} CAD zones · Courier API pending Phase 9`,
    },
    {
      id: "pickup",
      label: "Pickup Settings",
      href: "/configuration/pickup",
      status: state.pickup.enabled ? "configured" : "attention",
      detail: "Counter pickup active · Will-call planned for Phase 8",
    },
    {
      id: "notifications",
      label: "Notification Settings",
      href: "/configuration/notifications",
      status: "pending-backend",
      detail: `${state.notifications.filter((n) => n.enabled).length}/7 preferences on · Gateways not connected`,
    },
    {
      id: "users",
      label: "User Management",
      href: "/locations/users",
      status: state.users.length > 0 ? "configured" : "attention",
      detail: `${state.users.filter((u) => u.status === "active").length} active staff across Canadian roles`,
    },
    {
      id: "permissions",
      label: "Roles & Permissions",
      href: "/access/permissions",
      status: state.roles.length >= 10 ? "configured" : "attention",
      detail: `${state.roles.length} roles mapped to 16 permission controls`,
    },
  ];

  const configuredCount = modules.filter((m) => m.status === "configured").length;
  const pendingBackendCount = modules.filter((m) => m.status === "pending-backend").length;
  const attentionCount = modules.filter((m) => m.status === "attention").length;
  const readyPct = Math.round(((configuredCount + pendingBackendCount) / modules.length) * 100);

  const chartData = [
    { name: "Configured (UI)", value: configuredCount, color: "#1D9E75" },
    { name: "UI Ready · Gateway Pending", value: pendingBackendCount, color: "#087f8c" },
    ...(attentionCount > 0 ? [{ name: "Needs Attention", value: attentionCount, color: "#F5A524" }] : []),
  ];

  return (
    <article
      id="configuration-status"
      className={cn(
        "flex min-w-0 flex-col rounded-2xl border border-[#E6EEF2] bg-white p-5 scroll-mt-24",
        className,
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-ink">Phase 0 Configuration Status</h2>
            <Badge tone="brand" className="rounded-full text-[11px]">
              Session State
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted">
            Live readiness tracker across all Pharmacy &amp; Master Configuration screens
          </p>
        </div>
        <span className="text-xs font-semibold text-[#1D9E75]">{readyPct}% UI configured</span>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-12">
        {/* Donut Readiness Visual */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#EEF3F6] bg-[#F8FBFD] p-4 lg:col-span-4">
          <div className="relative h-44 w-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={74}
                  paddingAngle={3}
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} modules`, String(name)]}
                  contentStyle={{
                    backgroundColor: "#10233a",
                    border: "none",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#ffffff" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-2xl font-bold text-ink tabular-nums">{readyPct}%</p>
                <p className="text-[11px] font-medium text-muted">Phase 0 Ready</p>
              </div>
            </div>
          </div>
          <div className="mt-3 w-full space-y-1.5 text-xs">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-muted">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-semibold text-ink tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module Checklist */}
        <div className="grid gap-2 sm:grid-cols-2 lg:col-span-8">
          {modules.map((mod) => (
            <Link
              key={mod.id}
              href={mod.href}
              className="group flex items-start justify-between gap-2 rounded-xl border border-[#EEF3F6] bg-white p-3 transition hover:border-[#1D9E75]/45 hover:bg-[#F8FBFD]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  {mod.status === "attention" ? (
                    <CircleAlert className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  ) : (
                    <CheckCircle2
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        mod.status === "configured" ? "text-[#1D9E75]" : "text-[#087f8c]",
                      )}
                    />
                  )}
                  <p className="truncate text-xs font-semibold text-ink group-hover:text-[#178666]">
                    {mod.label}
                  </p>
                </div>
                <p className="mt-1 truncate text-[11px] text-muted">{mod.detail}</p>
              </div>
              <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted/60 transition-transform group-hover:translate-x-0.5 group-hover:text-[#1D9E75]" />
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

