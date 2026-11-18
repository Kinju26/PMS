"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Layers,
  Scale,
  Store,
  UserCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/cpos/fields";
import { StatusBadge } from "@/components/cpos/status-badge";
import { DAYS, provinceName } from "@/lib/cpos/constants";
import { useCpos } from "@/lib/cpos/store";
import { cn } from "@/lib/utils";

type SetupModuleCard = {
  id: string;
  title: string;
  status: "Configured" | "Needs Review" | "Incomplete";
  summary: string;
  meta: string;
  href: string;
  cta: string;
  icon: typeof Store;
  complete: boolean;
};

export function DashboardHome() {
  const { state } = useCpos();
  const [reviewedTaskIds, setReviewedTaskIds] = useState<string[]>([]);

  const detailsComplete = Boolean(
    state.pharmacy.legalName.trim() &&
      state.pharmacy.operatingName.trim() &&
      state.contact.street.trim() &&
      state.contact.city.trim() &&
      state.contact.postalCode.trim() &&
      state.contact.phone.trim() &&
      state.contact.email.trim(),
  );

  const regulatoryComplete = Boolean(
    state.regulatory.pharmacyLicenceNumber.trim() &&
      state.regulatory.regulatoryAuthority.trim() &&
      state.regulatory.primaryIdentifier.trim(),
  );

  const openDaysCount = state.hours.filter((h) => h.open).length;
  const hoursComplete = openDaysCount > 0;
  const holidaysComplete = state.holidays.length > 0;

  const activePic = state.picAssignments.find((p) => p.status === "active") ?? null;
  const picComplete = Boolean(
    activePic && activePic.pharmacistName.trim() && activePic.registrationNumber.trim(),
  );

  const masterComplete =
    state.masterConfig.departments.length > 0 &&
    state.masterConfig.prescriptionStatuses.length > 0 &&
    state.masterConfig.paymentMethods.length > 0 &&
    state.masterConfig.taxRules.length > 0;

  const setupModules: SetupModuleCard[] = [
    {
      id: "pharmacy-details",
      title: "Pharmacy Details",
      status: detailsComplete ? "Configured" : "Incomplete",
      summary: `${state.pharmacy.operatingName} · ${state.contact.city}, ${provinceName(state.contact.province)}`,
      meta: `${state.contact.phone} · ${state.regional.timeZone}`,
      href: "/configuration/pharmacy",
      cta: detailsComplete ? "Edit Details" : "Complete Setup",
      icon: Store,
      complete: detailsComplete,
    },
    {
      id: "regulatory",
      title: "Regulatory Configuration",
      status: regulatoryComplete ? "Configured" : "Incomplete",
      summary: `${state.regulatory.regulatoryAuthority}`,
      meta: `Licence: ${state.regulatory.pharmacyLicenceNumber} · ${state.regulatory.additionalIdentifiers.length} custom IDs`,
      href: "/configuration/regulatory",
      cta: regulatoryComplete ? "Manage Identifiers" : "Configure",
      icon: Scale,
      complete: regulatoryComplete,
    },
    {
      id: "hours",
      title: "Operating Hours",
      status: hoursComplete ? "Configured" : "Incomplete",
      summary: `${openDaysCount} of 7 days open · Break windows configured`,
      meta: `Time zone: ${state.regional.timeZone}`,
      href: "/configuration/hours",
      cta: "Edit Schedule",
      icon: Clock3,
      complete: hoursComplete,
    },
    {
      id: "holidays",
      title: "Holiday Schedule",
      status: holidaysComplete ? "Configured" : "Needs Review",
      summary: `${state.holidays.length} scheduled holidays on calendar`,
      meta: `${state.holidays.filter((h) => h.closure === "full").length} closed · ${state.holidays.filter((h) => h.closure === "special").length} modified`,
      href: "/configuration/holidays",
      cta: "Manage Holidays",
      icon: CalendarDays,
      complete: holidaysComplete,
    },
    {
      id: "pic",
      title: "Pharmacist-in-Charge",
      status: picComplete ? "Configured" : "Incomplete",
      summary: activePic ? activePic.pharmacistName : "No active Pharmacist-in-Charge assigned",
      meta: activePic
        ? `Reg #: ${activePic.registrationNumber} · Since ${activePic.effectiveStartDate}`
        : "Assign an active PIC",
      href: "/configuration/pic",
      cta: picComplete ? "Manage Assignment" : "Assign PIC",
      icon: UserCheck,
      complete: picComplete,
    },
    {
      id: "master-config",
      title: "Master Configuration",
      status: masterComplete ? "Configured" : "Needs Review",
      summary: "7 categories: Locations, Departments, Rx Statuses, Payments, Tax, Notifications, Reference Data",
      meta: `${state.masterConfig.departments.length} departments · ${state.masterConfig.taxRules.length} tax rules`,
      href: "/configuration/master",
      cta: "Open Master Config",
      icon: Layers,
      complete: masterComplete,
    },
  ];

  const completedCoreCount = setupModules.slice(0, 5).filter((m) => m.complete).length;
  const setupPct = Math.round((completedCoreCount / 5) * 100);

  const pendingTasks = useMemo(() => {
    const tasks: Array<{
      id: string;
      task: string;
      module: string;
      priority: "Required" | "Recommended" | "Integration";
      href: string;
    }> = [];

    if (!detailsComplete) {
      tasks.push({
        id: "t-details",
        task: "Complete required pharmacy legal name, address, and contact fields",
        module: "Pharmacy Details",
        priority: "Required",
        href: "/configuration/pharmacy",
      });
    }
    if (!regulatoryComplete) {
      tasks.push({
        id: "t-reg",
        task: "Enter provincial pharmacy licence number and regulatory authority",
        module: "Regulatory Configuration",
        priority: "Required",
        href: "/configuration/regulatory",
      });
    }
    if (!picComplete) {
      tasks.push({
        id: "t-pic",
        task: "Assign an active Pharmacist-in-Charge with registration number",
        module: "Pharmacist-in-Charge",
        priority: "Required",
        href: "/configuration/pic",
      });
    }

    tasks.push(
      {
        id: "t-verify-tax",
        task: "Confirm provincial HST/GST tax rules and zero-rated prescription setting",
        module: "Master Configuration",
        priority: "Recommended",
        href: "/configuration/master/tax",
      },
      {
        id: "t-verify-holidays",
        task: "Review upcoming statutory and provincial holiday operating exceptions",
        module: "Holiday Schedule",
        priority: "Recommended",
        href: "/configuration/holidays",
      },
      {
        id: "t-review-rbac",
        task: "Verify high-risk clinical and claim permissions across pharmacy staff roles",
        module: "Users & Roles",
        priority: "Recommended",
        href: "/access/permissions",
      },
      {
        id: "t-connect-notif",
        task: "Connect Email and SMS notification gateways during backend integration",
        module: "Notification Preferences",
        priority: "Integration",
        href: "/configuration/master/notifications",
      },
    );

    return tasks;
  }, [detailsComplete, picComplete, regulatoryComplete]);

  const todayJs = new Date().getDay();
  const todayKey = DAYS[(todayJs + 6) % 7]?.key ?? "monday";
  const todaySchedule = state.hours.find((h) => h.day === todayKey);

  function toggleReviewed(id: string) {
    setReviewedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      <PageHeader
        eyebrow="Phase 0 · Pharmacy & Master Configuration"
        title="Pharmacy Setup Dashboard"
        description={`Track configuration readiness for ${state.pharmacy.operatingName} (${state.contact.city}, ${provinceName(state.contact.province)}). All baseline entries are clearly labeled demonstration data stored locally in your browser.`}
        status={
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={state.pharmacy.status} />
            <Badge tone="neutral">Demonstration Data</Badge>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/configuration/master">Master Configuration</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/configuration/pharmacy">Edit Pharmacy Details</Link>
            </Button>
          </div>
        }
      />

      {/* Setup Completion Summary Bar */}
      <section className="rounded-lg border border-[#DCE3EA] bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-wider text-muted uppercase">
                  Phase 0 Setup Completion
                </p>
                <p className="mt-1 text-2xl font-bold text-ink tabular-nums">
                  {setupPct}%{" "}
                  <span className="text-sm font-normal text-muted">
                    ({completedCoreCount} of 5 core pharmacy setup modules configured)
                  </span>
                </p>
              </div>
              <span className="text-xs font-medium text-muted">
                Today ({DAYS[(todayJs + 6) % 7]?.label}):{" "}
                <strong className="text-ink">
                  {todaySchedule?.open
                    ? `${todaySchedule.opens}–${todaySchedule.closes}`
                    : "Closed"}
                </strong>{" "}
                ({state.regional.timeZone})
              </span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#E6ECF1]">
              <div
                className="h-full rounded-full bg-[#087f8c] transition-all duration-300"
                style={{ width: `${setupPct}%` }}
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3 border-t border-[#E6ECF1] pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
            <div>
              <p className="text-[11px] font-medium text-muted">Active Staff</p>
              <p className="mt-0.5 text-lg font-bold text-ink tabular-nums">
                {state.users.filter((u) => u.status === "active").length} / {state.users.length}
              </p>
            </div>
            <div className="border-l border-[#E6ECF1] pl-3">
              <p className="text-[11px] font-medium text-muted">Configured Roles</p>
              <p className="mt-0.5 text-lg font-bold text-ink tabular-nums">{state.roles.length}</p>
            </div>
            <div className="border-l border-[#E6ECF1] pl-3">
              <p className="text-[11px] font-medium text-muted">Pending Tasks</p>
              <p className="mt-0.5 text-lg font-bold text-ink tabular-nums">
                {pendingTasks.length - reviewedTaskIds.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Setup Status Grid */}
      <section aria-label="Configuration module statuses" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {setupModules.map((mod) => {
          const Icon = mod.icon;
          const badgeTone =
            mod.status === "Configured"
              ? "success"
              : mod.status === "Needs Review"
                ? "warning"
                : "danger";
          return (
            <article
              key={mod.id}
              className="flex flex-col justify-between rounded-lg border border-[#DCE3EA] bg-white p-4 transition-colors hover:border-[#087f8c]/50"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#EEF5F7] text-[#087f8c]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-ink">{mod.title}</h2>
                      <div className="mt-0.5">
                        <Badge tone={badgeTone}>{mod.status}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs font-medium text-ink">{mod.summary}</p>
                <p className="mt-1 text-xs text-muted">{mod.meta}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#EEF2F6] pt-3">
                <Link
                  href={mod.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087f8c] hover:text-[#064e5b]"
                >
                  {mod.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      {/* Pending Setup Tasks + Recent Configuration Log */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Section
          title="Pending Setup Tasks"
          description="Actionable checklist to complete and verify Phase 0 pharmacy configuration."
          className="xl:col-span-7"
          action={
            <Badge tone="warning">
              {Math.max(0, pendingTasks.length - reviewedTaskIds.length)} open
            </Badge>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead className="border-b border-[#E6ECF1] bg-[#F8FAFC] text-[11px] font-semibold text-muted uppercase">
                <tr>
                  <th className="w-9 px-2.5 py-2">Done</th>
                  <th className="px-2.5 py-2">Setup Task</th>
                  <th className="px-2.5 py-2">Module</th>
                  <th className="px-2.5 py-2">Type</th>
                  <th className="px-2.5 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F6]">
                {pendingTasks.map((item) => {
                  const done = reviewedTaskIds.includes(item.id);
                  return (
                    <tr key={item.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-2.5 py-2.5">
                        <button
                          type="button"
                          onClick={() => toggleReviewed(item.id)}
                          aria-label={`Toggle "${item.task}"`}
                          className="text-[#087f8c]"
                        >
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 text-[#1D9E75]" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted/60" />
                          )}
                        </button>
                      </td>
                      <td className={cn("px-2.5 py-2.5 font-medium", done ? "text-muted line-through" : "text-ink")}>
                        {item.task}
                      </td>
                      <td className="px-2.5 py-2.5 text-muted whitespace-nowrap">{item.module}</td>
                      <td className="px-2.5 py-2.5">
                        <Badge
                          tone={
                            item.priority === "Required"
                              ? "danger"
                              : item.priority === "Integration"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {item.priority}
                        </Badge>
                      </td>
                      <td className="px-2.5 py-2.5 text-right whitespace-nowrap">
                        <Link
                          href={item.href}
                          className="font-semibold text-[#087f8c] hover:underline"
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          title="Recent Configuration Activity"
          description="Local configuration changes and baseline audit records."
          className="xl:col-span-5"
          action={
            <Link
              href="/audit-logs"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#087f8c] hover:underline"
            >
              Audit Logs
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <ul className="divide-y divide-[#EEF2F6] text-xs">
            {state.auditLogs.slice(0, 5).map((entry) => (
              <li key={entry.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink">{entry.action}</span>
                  <span className="shrink-0 font-mono text-[10px] text-muted">
                    {entry.timestamp}
                  </span>
                </div>
                <p className="mt-0.5 text-muted">{entry.detail}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Badge tone="brand">{entry.module}</Badge>
                  <Badge tone={entry.source === "session" ? "success" : "neutral"}>
                    {entry.source === "session" ? "Saved Locally" : "Demo"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-[#EEF2F6] pt-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-muted">
              <Users className="h-3.5 w-3.5 text-[#087f8c]" />
              Manage staff &amp; RBAC controls
            </span>
            <Link href="/locations/users" className="font-semibold text-[#087f8c] hover:underline">
              Users &amp; Roles →
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
}
