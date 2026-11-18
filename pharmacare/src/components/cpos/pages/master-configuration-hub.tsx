"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  CreditCard,
  GitBranch,
  Layers,
  Percent,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/cpos/fields";
import { useCpos } from "@/lib/cpos/store";

type MasterCategoryCard = {
  slug: string;
  title: string;
  description: string;
  countLabel: string;
  status: string;
  tone: "success" | "brand" | "warning";
  icon: LucideIcon;
};

export function MasterConfigurationHub() {
  const { state } = useCpos();

  const categories: MasterCategoryCard[] = [
    {
      slug: "locations",
      title: "Pharmacy Locations",
      description:
        "Manage primary pharmacy site settings and optional multi-location expansion records.",
      countLabel: `${state.locations.length} configured site${state.locations.length === 1 ? "" : "s"}`,
      status: "Active",
      tone: "success",
      icon: Building2,
    },
    {
      slug: "departments",
      title: "Departments",
      description:
        "Define operational units such as Dispensary, Compounding, Clinical Services, and Front Store.",
      countLabel: `${state.masterConfig.departments.filter((d) => d.status === "active").length} active / ${state.masterConfig.departments.length} total`,
      status: "Configured",
      tone: "success",
      icon: Layers,
    },
    {
      slug: "prescription-statuses",
      title: "Prescription Status Settings",
      description:
        "Configure workflow queue statuses, sequence ordering, and stage labels used across dispensing.",
      countLabel: `${state.masterConfig.prescriptionStatuses.filter((s) => s.active).length} active statuses`,
      status: "Configured",
      tone: "brand",
      icon: GitBranch,
    },
    {
      slug: "payment-methods",
      title: "Payment Methods",
      description:
        "Enable accepted tender types including Cash, Interac Debit, Credit Cards, and Drug Benefit Plans (CAD).",
      countLabel: `${state.masterConfig.paymentMethods.filter((p) => p.enabled).length} enabled tenders`,
      status: "Configured",
      tone: "success",
      icon: CreditCard,
    },
    {
      slug: "tax",
      title: "Tax Configuration",
      description:
        "Maintain provincial HST, GST, PST, or QST rates alongside zero-rated prescription medication rules.",
      countLabel: `${state.masterConfig.taxRules.filter((t) => t.active).length} active tax rules`,
      status: "Configured",
      tone: "brand",
      icon: Percent,
    },
    {
      slug: "notifications",
      title: "Notification Preferences",
      description:
        "Manage Email, SMS, Push channels and prescription/refill/delivery event preferences.",
      countLabel: `${state.notifications.filter((n) => n.enabled).length} of ${state.notifications.length} enabled`,
      status: "Gateways Pending",
      tone: "warning",
      icon: Bell,
    },
    {
      slug: "reference-data",
      title: "Common Reference Data",
      description:
        "Maintain standardized pharmacy lookup tables: dosage forms, administration routes, sig codes, and hold reasons.",
      countLabel: `${state.masterConfig.referenceData.length} reference codes`,
      status: "Configured",
      tone: "success",
      icon: BookOpen,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        eyebrow="Phase 0 · Master Configuration"
        title="Master Configuration"
        description="Centralized foundation tables governing pharmacy locations, departments, prescription queues, CAD tender methods, provincial taxes, notifications, and reference codes."
        status={<Badge tone="neutral">7 Categories · Demonstration Data</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.slug}
              href={`/configuration/master/${cat.slug}`}
              className="group flex flex-col justify-between rounded-lg border border-[#DCE3EA] bg-white p-5 transition-colors hover:border-[#087f8c]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#EEF5F7] text-[#087f8c]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge tone={cat.tone}>{cat.status}</Badge>
                </div>
                <h2 className="mt-3.5 text-sm font-semibold text-ink group-hover:text-[#087f8c]">
                  {cat.title}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{cat.description}</p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#EEF2F6] pt-3 text-xs">
                <span className="font-medium text-muted">{cat.countLabel}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#087f8c]">
                  Configure
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

