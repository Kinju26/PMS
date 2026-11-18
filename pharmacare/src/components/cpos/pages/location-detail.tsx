"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/cpos/fields";
import { StatusBadge } from "@/components/cpos/status-badge";
import { DAYS, provinceName } from "@/lib/cpos/constants";
import { useCpos } from "@/lib/cpos/store";

export function LocationDetail({ id }: { id: string }) {
  const { state } = useCpos();
  const location = state.locations.find((item) => item.id === id);

  if (!location) {
    return (
      <PageHeader
        title="Location not found"
        description="This location is not in the current session."
        actions={
          <Button asChild variant="secondary">
            <Link href="/locations">Back to locations</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        eyebrow={location.code}
        title={location.operatingName}
        description={`${location.street}, ${location.city}, ${provinceName(location.province)} ${location.postalCode}`}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/locations">All locations</Link>
            </Button>
            <Button asChild>
              <Link href={`/locations/${location.id}/edit`}>Edit</Link>
            </Button>
          </>
        }
      />
      <Section title="Location record">
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          {[
            ["Legal name", location.legalName],
            ["Manager", location.manager],
            ["Pharmacist-in-charge", location.pharmacistInCharge],
            ["Phone", location.phone],
            ["Email", location.email],
            ["Time zone", location.timeZone],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
          <div>
            <dt className="text-xs text-muted">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={location.status} />
            </dd>
          </div>
        </dl>
      </Section>
      <Section title="Operating hours">
        <ul className="space-y-1 text-sm">
          {location.hours.map((row) => (
            <li key={row.day} className="flex justify-between border-b border-line py-2">
              <span>{DAYS.find((day) => day.key === row.day)?.label}</span>
              <span className="text-muted">{row.open ? `${row.opens}–${row.closes}` : "Closed"}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
