import { Layers } from "lucide-react";
import { FUTURE_PHASES } from "@/lib/cpos/constants";

export function FutureRoadmapStrip() {
  return (
    <section className="rounded-2xl border border-[#E6EEF2] bg-white p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#F4F8FB] text-[#087f8c]">
            <Layers className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink">
              CPOS Platform Roadmap (Phases 1 – 11)
            </h2>
            <p className="text-xs text-muted">
              Modular frontend architecture ready for phased delivery after Phase 0 review &amp; approval
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#E7F6F1] px-2.5 py-1 text-[11px] font-semibold text-[#178666]">
          Current Scope: Phase 0 Only
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {FUTURE_PHASES.map((item) => (
          <div
            key={item.phase}
            className="flex items-center gap-2 rounded-xl border border-dashed border-[#DCEAEF] bg-[#F8FBFD] px-3 py-2 text-xs"
          >
            <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#087f8c] ring-1 ring-[#E6EEF2]">
              {item.phase}
            </span>
            <span className="truncate text-muted">{item.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

