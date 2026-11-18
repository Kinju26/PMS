"use client";

import Link from "next/link";
import { BookOpen, Keyboard, RotateCcw, ScrollText, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/cpos/fields";
import { FUTURE_PHASES } from "@/lib/cpos/constants";
import { useCpos } from "@/lib/cpos/store";

export default function SupportPage() {
  const { state, resetDemoData } = useCpos();

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        eyebrow="System & Documentation"
        title="Support & Phase 0 Guide"
        description="Operational reference, keyboard shortcuts, demonstration storage controls, and CPOS rollout roadmap."
        status={<Badge tone="brand">CPOS · Phase 0</Badge>}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Section
          title="Local Demonstration Persistence"
          description="Configuration edits are saved locally in browser storage so changes persist across refreshes."
        >
          <div className="space-y-3 text-xs text-muted">
            <p>
              Active pharmacy profile:{" "}
              <strong className="text-ink">{state.pharmacy.operatingName}</strong> ({state.contact.city},{" "}
              {state.contact.province})
            </p>
            <p>
              Backend APIs, permanent database storage, and live third-party pharmacy integrations are intentionally excluded from this frontend phase.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" size="sm" variant="secondary" onClick={resetDemoData}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Demonstration Data
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/audit-logs">
                  <ScrollText className="h-3.5 w-3.5" />
                  View Audit Logs
                </Link>
              </Button>
            </div>
          </div>
        </Section>

        <Section
          title="Keyboard Shortcuts & Quick Links"
          description="Streamlined navigation modeled for high-efficiency pharmacy administration."
        >
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-center justify-between border-b border-[#EEF2F6] pb-2">
              <span className="inline-flex items-center gap-2 text-ink">
                <Keyboard className="h-3.5 w-3.5 text-[#087f8c]" />
                Focus Global Module Search
              </span>
              <kbd className="rounded border border-[#DCE3EA] bg-[#F8FAFC] px-2 py-0.5 font-mono text-[11px]">
                Ctrl + K
              </kbd>
            </li>
            <li className="flex items-center justify-between border-b border-[#EEF2F6] pb-2">
              <span className="inline-flex items-center gap-2 text-ink">
                <ShieldCheck className="h-3.5 w-3.5 text-[#087f8c]" />
                Review Role-to-Permission Matrix
              </span>
              <Link href="/access/permissions" className="font-semibold text-[#087f8c] hover:underline">
                Open Matrix →
              </Link>
            </li>
            <li className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-ink">
                <BookOpen className="h-3.5 w-3.5 text-[#087f8c]" />
                Master Reference Tables
              </span>
              <Link href="/configuration/master/reference-data" className="font-semibold text-[#087f8c] hover:underline">
                Open Tables →
              </Link>
            </li>
          </ul>
        </Section>
      </div>

      <Section
        title="CPOS Phased Delivery Roadmap"
        description="Phase 0 establishes master pharmacy setup and governance. Future phases build incrementally on this architecture."
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {FUTURE_PHASES.map((item) => (
            <div
              key={item.phase}
              className="flex items-center gap-2 rounded-md border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs"
            >
              <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#087f8c] ring-1 ring-[#DCE3EA]">
                {item.phase}
              </span>
              <span className="truncate text-muted">{item.name}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

