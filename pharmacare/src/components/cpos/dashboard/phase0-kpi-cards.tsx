"use client";

import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock3,
  KeyRound,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";
import { DAYS, PERMISSION_CATALOG } from "@/lib/cpos/constants";
import { useCpos } from "@/lib/cpos/store";
import { cn } from "@/lib/utils";

type Phase0Kpi = {
  id: string;
  title: string;
  value: string;
  badge: string;
  subtitle: string;
  tone: "emerald" | "teal" | "sky" | "indigo" | "rose" | "amber";
  icon: LucideIcon;
  href: string;
};

const toneStyles: Record<
  Phase0Kpi["tone"],
  { iconBg: string; badge: string; hoverBorder: string }
> = {
  emerald: {
    iconBg: "bg-[#E7F6F1] text-[#1D9E75]",
    badge: "bg-emerald-50 text-emerald-700",
    hoverBorder: "hover:border-[#1D9E75]/45",
  },
  teal: {
    iconBg: "bg-teal-light text-[#087f8c]",
    badge: "bg-teal-surface text-[#066b77]",
    hoverBorder: "hover:border-[#087f8c]/45",
  },
  sky: {
    iconBg: "bg-sky-50 text-sky-600",
    badge: "bg-sky-50 text-sky-700",
    hoverBorder: "hover:border-sky-300",
  },
  indigo: {
    iconBg: "bg-indigo-50 text-indigo-600",
    badge: "bg-indigo-50 text-indigo-700",
    hoverBorder: "hover:border-indigo-300",
  },
  rose: {
    iconBg: "bg-red-50 text-red-600",
    badge: "bg-red-50 text-red-700",
    hoverBorder: "hover:border-red-300",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600",
    badge: "bg-amber-50 text-amber-800",
    hoverBorder: "hover:border-amber-300",
  },
};

export function Phase0KpiCards() {
  const { state } = useCpos();

  // Compute Pharmacy Profile completion dynamically from real session state
  const profileChecks = [
    state.pharmacy.legalName,
    state.pharmacy.operatingName,
    state.pharmacy.regulatoryId,
    state.pharmacy.pharmacistInCharge,
    state.contact.street,
    state.contact.city,
    state.contact.province,
    state.contact.postalCode,
    state.contact.phone,
    state.contact.email,
    state.regional.timeZone,
  ];
  const profilePct = Math.round(
    (profileChecks.filter((v) => v && v.trim().length > 0).length / profileChecks.length) * 100,
  );

  // Module readiness count
  const moduleReadyFlags = [
    profilePct === 100,
    state.hours.some((h) => h.open),
    state.holidays.length > 0,
    state.locations.length > 0,
    state.delivery.zones.length > 0,
    state.pickup.instructions.trim().length > 0,
    state.notifications.some((n) => n.enabled),
    state.users.length > 0,
    state.roles.length >= 10,
  ];
  const modulesReady = moduleReadyFlags.filter(Boolean).length;

  // Today's operating hours status
  const todayJs = new Date().getDay(); // 0=Sun..6=Sat
  const dayKey = DAYS[(todayJs + 6) % 7]?.key ?? "monday";
  const todayRow = state.hours.find((h) => h.day === dayKey);
  const openDaysCount = state.hours.filter((h) => h.open).length;

  // Users & Roles
  const activeUsers = state.users.filter((u) => u.status === "active").length;
  const highRiskPermCount = PERMISSION_CATALOG.filter((p) => p.highRisk).length;

  const cards: Phase0Kpi[] = [
    {
      id: "profile-completion",
      title: "Pharmacy Profile",
      value: `${profilePct}%`,
      badge: state.pharmacy.status === "active" ? "Active" : state.pharmacy.status,
      subtitle: `${state.pharmacy.province} · ${state.regional.timeZone}`,
      tone: "emerald",
      icon: CheckCircle2,
      href: "/configuration/pharmacy",
    },
    {
      id: "config-status",
      title: "Configuration Status",
      value: `${modulesReady} / ${moduleReadyFlags.length}`,
      badge: modulesReady === moduleReadyFlags.length ? "Baseline Ready" : "In Progress",
      subtitle: "Phase 0 modules configured",
      tone: "teal",
      icon: SlidersHorizontal,
      href: "/dashboard#configuration-status",
    },
    {
      id: "operating-hours",
      title: "Operating Hours",
      value: `${openDaysCount} Days`,
      badge: todayRow?.open ? `${todayRow.opens}–${todayRow.closes}` : "Closed Today",
      subtitle: `${state.specialHours.length} special · ${state.holidays.length} holidays`,
      tone: "sky",
      icon: Clock3,
      href: "/configuration/hours",
    },
    {
      id: "active-users",
      title: "Active Users",
      value: String(activeUsers),
      badge: `${activeUsers} / ${state.users.length} active`,
      subtitle: "Staff accounts (session)",
      tone: "indigo",
      icon: Users,
      href: "/locations/users",
    },
    {
      id: "roles-permissions",
      title: "Roles & Permissions",
      value: `${state.roles.length} Roles`,
      badge: `${highRiskPermCount} high-risk`,
      subtitle: `${PERMISSION_CATALOG.length} permission categories`,
      tone: "rose",
      icon: KeyRound,
      href: "/access/permissions",
    },
    {
      id: "locations-mode",
      title: "Location Mode",
      value: state.locations.length === 1 ? "Single Site" : `${state.locations.length} Sites`,
      badge: "Multi-site ready",
      subtitle: state.locations[0]?.code ?? "Primary pharmacy",
      tone: "amber",
      icon: Building2,
      href: "/locations",
    },
  ];

  return (
    <section
      aria-label="Phase 0 configuration metrics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const style = toneStyles[card.tone];
        return (
          <Link
            key={card.id}
            href={card.href}
            className={cn(
              "group flex h-full flex-col justify-between rounded-2xl border border-[#E6EEF2] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75]/40",
              style.hoverBorder,
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold tracking-wide text-muted uppercase">
                  {card.title}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-ink tabular-nums sm:text-[28px]">
                  {card.value}
                </p>
              </div>
              <span
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                  style.iconBg,
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F5F8] pt-3">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                  style.badge,
                )}
              >
                {card.badge}
              </span>
              <span className="truncate text-xs text-muted">{card.subtitle}</span>
            </div>
          </Link>
        );
      })}
    </section>
  );
}

