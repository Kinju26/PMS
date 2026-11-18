"use client";

import Link from "next/link";
import { Building2, CalendarDays, KeyRound, ShieldCheck, Store, Users } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { provinceName } from "@/lib/cpos/constants";
import { useCpos } from "@/lib/cpos/store";
import { useSession } from "@/lib/session";

export function DashboardHeader() {
  const session = useSession();
  const { state } = useCpos();

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-CA", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#DCEAEF] bg-gradient-to-r from-[#EAF8F5] via-[#F5FBFD] to-[#EBF5FA] p-5 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-12 h-48 w-48 rounded-full bg-[#1D9E75]/10 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 right-1/4 h-44 w-44 rounded-full bg-[#087f8c]/10 blur-2xl"
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand" className="gap-1 rounded-full">
              <ShieldCheck className="h-3 w-3" />
              Phase 0 · Master Configuration
            </Badge>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DCEAEF] bg-white/85 px-2.5 py-0.5 text-xs font-medium text-ink">
              <CalendarDays className="h-3.5 w-3.5 text-[#1D9E75]" />
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DCEAEF] bg-white/80 px-2.5 py-0.5 text-xs font-medium text-muted">
              <Building2 className="h-3 w-3 text-[#087f8c]" />
              {state.pharmacy.operatingName} · {provinceName(state.contact.province)} ({state.regional.currency})
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
              Welcome Back, Admin
            </h1>
            <p className="mt-1 text-sm text-muted">
              Canadian Pharmacy Operating System readiness overview for{" "}
              <span className="font-medium text-ink">{state.pharmacy.legalName}</span> · Signed in as{" "}
              <span className="font-medium text-ink">{session.name}</span>.
            </p>
          </div>
        </div>

        {/* Phase 0 Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/configuration/pharmacy"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1D9E75] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_-8px_rgba(29,158,117,0.85)] transition hover:bg-[#178666] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75]/50"
          >
            <Store className="h-4 w-4" />
            Pharmacy Profile
          </Link>
          <Link
            href="/locations/users"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D5E4EA] bg-white px-3.5 text-sm font-semibold text-ink transition hover:border-[#1D9E75]/40 hover:bg-[#F8FCFD]"
          >
            <Users className="h-4 w-4 text-[#087f8c]" />
            Manage Users
          </Link>
          <Link
            href="/access/permissions"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D5E4EA] bg-white px-3.5 text-sm font-semibold text-ink transition hover:border-[#1D9E75]/40 hover:bg-[#F8FCFD]"
          >
            <KeyRound className="h-4 w-4 text-[#1D9E75]" />
            Role Matrix
          </Link>
        </div>
      </div>
    </section>
  );
}
