"use client";

import Link from "next/link";
import { ArrowRight, BellOff, Clock3, Package, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DAYS } from "@/lib/cpos/constants";
import { useCpos } from "@/lib/cpos/store";
import { cn } from "@/lib/utils";

export function OperatingHoursSummaryCard({ className }: { className?: string }) {
  const { state } = useCpos();
  const todayJs = new Date().getDay();
  const todayKey = DAYS[(todayJs + 6) % 7]?.key ?? "monday";

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col justify-between rounded-2xl border border-[#E6EEF2] bg-white p-5",
        className,
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-ink">Operating Hours Status</h2>
            <p className="mt-0.5 text-xs text-muted">
              Time zone: <span className="font-medium text-ink">{state.regional.timeZone}</span>
            </p>
          </div>
          <Link
            href="/configuration/hours"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#1D9E75] hover:text-[#178666]"
          >
            Edit Hours
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ul className="mt-4 divide-y divide-[#F1F5F8] text-xs">
          {state.hours.map((row) => {
            const label = DAYS.find((d) => d.key === row.day)?.label ?? row.day;
            const isToday = row.day === todayKey;
            return (
              <li
                key={row.day}
                className={cn(
                  "flex items-center justify-between py-2",
                  isToday && "rounded-lg bg-[#E7F6F1]/55 px-2 font-semibold",
                )}
              >
                <span className="flex items-center gap-1.5 text-ink">
                  <Clock3 className={cn("h-3.5 w-3.5", row.open ? "text-[#1D9E75]" : "text-muted/60")} />
                  {label}
                  {isToday ? (
                    <span className="rounded bg-[#1D9E75] px-1.5 py-0.2 text-[10px] font-semibold text-white">
                      Today
                    </span>
                  ) : null}
                </span>
                <span className={cn("tabular-nums", row.open ? "text-ink" : "text-muted")}>
                  {row.open ? `${row.opens} – ${row.closes}` : "Closed"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Service Availability Quick Status */}
      <div className="mt-4 space-y-2 border-t border-[#F1F5F8] pt-3.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-muted">
            <Truck className="h-3.5 w-3.5 text-[#087f8c]" />
            Delivery ({state.delivery.zones.length} zones)
          </span>
          <Badge tone={state.delivery.enabled ? "success" : "neutral"} className="rounded-full text-[10px]">
            {state.delivery.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-muted">
            <Package className="h-3.5 w-3.5 text-[#1D9E75]" />
            Counter Pickup
          </span>
          <Badge tone={state.pickup.enabled ? "success" : "neutral"} className="rounded-full text-[10px]">
            {state.pickup.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-muted">
            <BellOff className="h-3.5 w-3.5 text-amber-600" />
            SMS / Email Gateways
          </span>
          <Badge tone="warning" className="rounded-full text-[10px]">
            Not connected
          </Badge>
        </div>
      </div>
    </article>
  );
}

