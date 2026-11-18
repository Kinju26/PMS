"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PendingTask = {
  id: string;
  title: string;
  detail: string;
  category: "Governance" | "Backend Dependency" | "Operations";
  href: string;
};

const initialTasks: PendingTask[] = [
  {
    id: "task-dur",
    title: "Verify DUR Override & Clinical Verification matrix",
    detail: "Ensure only Pharmacist and Pharmacy Manager roles hold high-risk clinical sign-off.",
    category: "Governance",
    href: "/access/permissions",
  },
  {
    id: "task-gateways",
    title: "Connect Canadian SMS & Email notification providers",
    detail: "Preferences are saved; external gateway credentials require backend API integration.",
    category: "Backend Dependency",
    href: "/configuration/notifications",
  },
  {
    id: "task-holidays",
    title: "Confirm 2027 provincial statutory holiday schedule",
    detail: "Review full closures and shortened special hours for your operating province.",
    category: "Operations",
    href: "/configuration/holidays",
  },
  {
    id: "task-willcall",
    title: "Plan Will-Call bin numbering policy for Phase 8",
    detail: "Pickup instructions are active; hanging-bag automation will activate in Phase 8.",
    category: "Backend Dependency",
    href: "/configuration/pickup",
  },
  {
    id: "task-staff",
    title: "Review inactive staff accounts & provincial licences",
    detail: "Confirm OCP / College licence numbers for regulated clinical team members.",
    category: "Governance",
    href: "/locations/users",
  },
];

export function PendingTasksCard({ className }: { className?: string }) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  function toggleTask(id: string) {
    setCheckedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  const remaining = initialTasks.length - checkedIds.length;

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col rounded-2xl border border-[#E6EEF2] bg-white p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-ink">Pending Configuration Tasks</h2>
          <p className="mt-0.5 text-xs text-muted">
            Phase 0 sign-off items &amp; upcoming backend handoff checklist
          </p>
        </div>
        <Badge tone={remaining === 0 ? "success" : "warning"} className="shrink-0 rounded-full">
          {remaining === 0 ? "All reviewed" : `${remaining} remaining`}
        </Badge>
      </div>

      <ul className="mt-4 divide-y divide-[#F1F5F8]">
        {initialTasks.map((task) => {
          const done = checkedIds.includes(task.id);
          return (
            <li key={task.id} className="flex items-start gap-3 py-3 first:pt-1 last:pb-0">
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                aria-label={`Mark "${task.title}" ${done ? "incomplete" : "reviewed"}`}
                className="mt-0.5 shrink-0 text-[#1D9E75] transition hover:scale-105"
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-[#1D9E75]" />
                ) : (
                  <Circle className="h-4 w-4 text-muted/60" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      done ? "text-muted line-through" : "text-ink",
                    )}
                  >
                    {task.title}
                  </p>
                  <Badge
                    tone={task.category === "Backend Dependency" ? "warning" : "neutral"}
                    className="rounded-full text-[10px]"
                  >
                    {task.category}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted">{task.detail}</p>
              </div>
              <Link
                href={task.href}
                aria-label={`Open ${task.title}`}
                className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#E6EEF2] text-muted transition hover:border-[#1D9E75] hover:text-[#1D9E75]"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

