"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Section, Select } from "@/components/cpos/fields";
import { useCpos } from "@/lib/cpos/store";
import type { SharedRecordsConfig } from "@/types/cpos";

export function SharedRecords() {
  const { state, saveSharedRecords } = useCpos();
  const [config, setConfig] = useState<SharedRecordsConfig>(state.sharedRecords);

  function updateAccess(locationId: string, patch: { canView?: boolean; canEdit?: boolean }) {
    setConfig((current) => ({
      ...current,
      access: current.access.map((row) => (row.locationId === locationId ? { ...row, ...patch } : row)),
    }));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        eyebrow="Multi-Location Management"
        title="Shared patient records"
        description="Access to patient information must follow applicable privacy rules and the authorization policy set here. This screen does not grant access by itself."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => setConfig(state.sharedRecords)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => saveSharedRecords(config)}>
              Save policy
            </Button>
          </>
        }
      />
      <Section title="Network policy">
        <div className="space-y-4">
          <label className="flex items-center justify-between text-sm">
            Enable shared patient records
            <Switch checked={config.enabled} onCheckedChange={(enabled) => setConfig((current) => ({ ...current, enabled }))} />
          </label>
          <label className="block text-sm">
            Patient record visibility
            <Select
              className="mt-1.5"
              value={config.visibility}
              onChange={(event) =>
                setConfig((current) => ({ ...current, visibility: event.target.value as SharedRecordsConfig["visibility"] }))
              }
            >
              <option value="treating-location">Treating location only</option>
              <option value="authorized-network">Authorized locations in this network</option>
              <option value="restricted">Restricted — named staff only</option>
            </Select>
          </label>
          <label className="flex items-center justify-between text-sm">
            Apply location-based access restrictions
            <Switch
              checked={config.restrictByLocation}
              onCheckedChange={(restrictByLocation) => setConfig((current) => ({ ...current, restrictByLocation }))}
            />
          </label>
        </div>
      </Section>
      <Section title="Location access permissions" description="View lets a location read a shared chart. Edit lets authorized clinicians update it.">
        <div className="divide-y divide-line">
          {config.access.map((row) => {
            const location = state.locations.find((item) => item.id === row.locationId);
            return (
              <div key={row.locationId} className="grid items-center gap-3 py-3 md:grid-cols-[1fr_auto_auto]">
                <p className="text-sm font-medium">{location?.operatingName ?? row.locationId}</p>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={row.canView} onCheckedChange={(canView) => updateAccess(row.locationId, { canView })} />
                  View
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={row.canEdit} onCheckedChange={(canEdit) => updateAccess(row.locationId, { canEdit: canEdit && row.canView })} />
                  Edit
                </label>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
