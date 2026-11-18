"use client";

import Link from "next/link";
import { Building2, CheckCircle2, MapPin, Phone, Plus, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/cpos/data-table";
import { PageHeader, Section } from "@/components/cpos/fields";
import { StatusBadge } from "@/components/cpos/status-badge";
import { provinceName } from "@/lib/cpos/constants";
import { useCpos } from "@/lib/cpos/store";

export function LocationOverview() {
  const { state, setLocationStatus } = useCpos();
  const primaryLocation = state.locations.find((loc) => loc.isPrimary) ?? state.locations[0];
  const counts = {
    total: state.locations.length,
    active: state.locations.filter((location) => location.status === "active").length,
    inactive: state.locations.filter((location) => location.status === "inactive").length,
    pending: state.locations.filter((location) => location.status === "pending").length,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        eyebrow="Phase 0 · Pharmacy Configuration"
        title="Location Configuration"
        description="Manage your primary pharmacy site today while keeping multi-location architecture ready for future expansion."
        actions={
          <Button asChild>
            <Link href="/locations/new">
              <Plus className="h-4 w-4" />
              Add location (optional)
            </Link>
          </Button>
        }
      />

      {/* Single-pharmacy first-deployment guidance */}
      <div className="rounded-2xl border border-[#DCEAEF] bg-gradient-to-r from-[#EAF8F5] via-[#F7FCFD] to-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand" className="rounded-full">
                {counts.total === 1 ? "Single-Location Deployment" : `Multi-Location (${counts.total} Sites)`}
              </Badge>
              <span className="text-xs font-medium text-muted">Multi-location scalable</span>
            </div>
            <h2 className="text-base font-semibold text-ink">
              {primaryLocation ? primaryLocation.operatingName : state.pharmacy.operatingName}
            </h2>
            {primaryLocation ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#1D9E75]" />
                  {primaryLocation.street}, {primaryLocation.city}, {primaryLocation.province}{" "}
                  {primaryLocation.postalCode}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#087f8c]" />
                  {primaryLocation.phone}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted" />
                  Code: {primaryLocation.code}
                </span>
              </div>
            ) : null}
          </div>

          {primaryLocation ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link href={`/locations/${primaryLocation.id}`}>View Details</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/locations/${primaryLocation.id}/edit`}>
                  <Settings2 className="h-3.5 w-3.5" />
                  Configure Location
                </Link>
              </Button>
            </div>
          ) : null}
        </div>

        {/* Location-specific configuration flags */}
        {primaryLocation ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#DCEAEF]/80 pt-3.5 text-xs">
            <span className="font-medium text-muted">Active site modules:</span>
            <Badge tone={primaryLocation.deliveryEnabled ? "success" : "neutral"} className="rounded-full">
              Delivery: {primaryLocation.deliveryEnabled ? "Enabled" : "Off"}
            </Badge>
            <Badge tone={primaryLocation.pickupEnabled ? "success" : "neutral"} className="rounded-full">
              Pickup: {primaryLocation.pickupEnabled ? "Enabled" : "Off"}
            </Badge>
            <Badge tone={primaryLocation.notificationsEnabled ? "success" : "neutral"} className="rounded-full">
              Notifications: {primaryLocation.notificationsEnabled ? "Configured" : "Off"}
            </Badge>
            <Badge tone="neutral" className="rounded-full">
              TZ: {primaryLocation.timeZone}
            </Badge>
          </div>
        ) : null}
      </div>

      {/* Summary metrics */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Configured Locations", counts.total],
          ["Active", counts.active],
          ["Inactive", counts.inactive],
          ["Pending Setup", counts.pending],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
            <p className="text-xs font-medium text-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold text-ink tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Configured Locations Table */}
      <Section
        title="Configured Pharmacy Locations"
        description="Initial deployment requires only one active location. Add additional branches whenever your pharmacy expands."
      >
        <DataTable
          rows={state.locations}
          searchPlaceholder="Search location name, code, or city..."
          getSearchText={(row) => `${row.operatingName} ${row.code} ${row.city} ${row.manager}`}
          columns={[
            {
              key: "name",
              header: "Location Name",
              cell: (row) => (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{row.operatingName}</span>
                  {row.isPrimary ? (
                    <Badge tone="brand" className="rounded-full text-[10px]">
                      Primary
                    </Badge>
                  ) : null}
                </div>
              ),
            },
            {
              key: "address",
              header: "Address",
              cell: (row) => `${row.street}, ${row.city}, ${provinceName(row.province)}`,
            },
            { key: "phone", header: "Phone", cell: (row) => row.phone },
            {
              key: "config",
              header: "Location Config",
              cell: (row) => (
                <div className="flex flex-wrap gap-1">
                  {row.deliveryEnabled ? (
                    <span className="rounded bg-[#E7F6F1] px-1.5 py-0.5 text-[10px] font-medium text-[#178666]">
                      Delivery
                    </span>
                  ) : null}
                  {row.pickupEnabled ? (
                    <span className="rounded bg-teal-surface px-1.5 py-0.5 text-[10px] font-medium text-[#066b77]">
                      Pickup
                    </span>
                  ) : null}
                  <span className="rounded bg-[#F4F8FB] px-1.5 py-0.5 text-[10px] font-medium text-muted">
                    {row.code}
                  </span>
                </div>
              ),
            },
            { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
            {
              key: "actions",
              header: "Actions",
              cell: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/locations/${row.id}`}>View</Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/locations/${row.id}/edit`}>Edit</Link>
                  </Button>
                  {!row.isPrimary ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setLocationStatus(row.id, row.status === "active" ? "inactive" : "active")
                      }
                    >
                      {row.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      </Section>

      <div className="flex items-start gap-2.5 rounded-xl border border-[#E6EEF2] bg-white px-4 py-3 text-xs text-muted">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1D9E75]" />
        <p>
          <span className="font-semibold text-ink">Single-site ready, multi-branch capable:</span>{" "}
          You do not need to configure multiple branches during Phase 0 setup. All pharmacy profile, hours, and access rules operate cleanly on your primary location and scale automatically when additional locations are added.
        </p>
      </div>
    </div>
  );
}
