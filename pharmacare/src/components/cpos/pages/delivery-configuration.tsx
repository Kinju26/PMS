"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Clock3, Info, Plus, Truck } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/cpos/data-table";
import { Field, PageHeader, Section } from "@/components/cpos/fields";
import { zoneSchema } from "@/lib/cpos/schemas";
import { useCpos } from "@/lib/cpos/store";
import { createId } from "@/lib/utils";
import type { DeliveryTimeWindow, DeliveryZone } from "@/types/cpos";

const blankZone = (): DeliveryZone => ({
  id: "zone-new",
  name: "",
  serviceAreas: "",
  postalCodes: "",
  fee: "0.00",
  minimumOrder: "0.00",
  eta: "",
  available: true,
});

export function DeliveryConfiguration() {
  const { state, saveDeliveryEnabled, saveDeliverySettings, saveZone, deleteZone } = useCpos();
  const [editing, setEditing] = useState<DeliveryZone | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DeliveryZone | null>(null);
  const [instructions, setInstructions] = useState(state.delivery.instructions);
  const [timeWindows, setTimeWindows] = useState<DeliveryTimeWindow[]>(state.delivery.timeWindows);

  const form = useForm<DeliveryZone>({
    resolver: zodResolver(zoneSchema),
    defaultValues: blankZone(),
  });
  const zoneAvailable = useWatch({ control: form.control, name: "available" });

  function openEditor(zone?: DeliveryZone) {
    const next = zone ?? { ...blankZone(), id: createId("zone") };
    setEditing(next);
    form.reset(next);
  }

  function updateWindow(id: string, patch: Partial<DeliveryTimeWindow>) {
    setTimeWindows((current) => current.map((win) => (win.id === id ? { ...win, ...patch } : win)));
  }

  function saveOperationsSettings() {
    saveDeliverySettings({
      enabled: state.delivery.enabled,
      instructions,
      timeWindows,
    });
  }

  const activeZones = state.delivery.zones.filter((z) => z.available).length;
  const activeWindows = timeWindows.filter((w) => w.enabled).length;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        eyebrow="Phase 0 · Pharmacy Configuration"
        title="Delivery Configuration"
        description="Configure local pharmacy delivery availability, service areas, CAD fee zones, delivery time windows, and handoff instructions."
        actions={
          <Button type="button" onClick={() => openEditor()} disabled={!state.delivery.enabled}>
            <Plus className="h-4 w-4" />
            Add delivery zone
          </Button>
        }
      />

      {/* Integration disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-xs text-amber-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p>
          <span className="font-semibold">Phase 0 Configuration Only:</span> External courier APIs, route dispatch, and GPS proof-of-delivery tracking are not connected yet (scheduled for <span className="font-semibold">Phase 9: Delivery Management</span>).
        </p>
      </div>

      {/* Configuration Status Strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <p className="text-xs font-medium text-muted">Configuration Status</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge tone={state.delivery.enabled ? "success" : "neutral"} className="rounded-full">
              {state.delivery.enabled ? "Configured · Active" : "Disabled"}
            </Badge>
          </div>
          <p className="mt-1 text-[11px] text-muted">Courier integration: Not connected</p>
        </div>
        <div className="rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <p className="text-xs font-medium text-muted">Active Delivery Zones</p>
          <p className="mt-1 text-2xl font-bold text-ink tabular-nums">
            {activeZones} / {state.delivery.zones.length}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">CAD pricing &amp; postal prefixes</p>
        </div>
        <div className="rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <p className="text-xs font-medium text-muted">Delivery Time Windows</p>
          <p className="mt-1 text-2xl font-bold text-ink tabular-nums">
            {activeWindows} / {timeWindows.length}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">Scheduled in {state.regional.timeZone}</p>
        </div>
      </div>

      {/* Availability Toggle */}
      <Section
        title="Delivery Availability"
        description="Control whether patient delivery service is offered for this pharmacy. Disabling retains zone configuration for later use."
      >
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#E7F6F1] text-[#1D9E75]">
              <Truck className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">
                {state.delivery.enabled ? "Local prescription delivery is enabled" : "Local prescription delivery is disabled"}
              </span>
              <span className="block text-xs text-muted">
                Applies to zones and time windows configured below.
              </span>
            </span>
          </span>
          <Switch
            checked={state.delivery.enabled}
            onCheckedChange={saveDeliveryEnabled}
            aria-label="Enable delivery availability"
          />
        </label>
      </Section>

      {/* Delivery Zones & Service Areas */}
      <Section
        title="Delivery Zones & Service Areas"
        description="Maintain Canadian postal code prefixes, neighbourhood service areas, CAD delivery fees, and minimum order thresholds."
      >
        <DataTable
          rows={state.delivery.zones}
          searchPlaceholder="Search zone, service area, or postal code..."
          getSearchText={(row) => `${row.name} ${row.serviceAreas} ${row.postalCodes}`}
          columns={[
            {
              key: "name",
              header: "Zone & Service Areas",
              cell: (row) => (
                <div>
                  <p className="font-semibold text-ink">{row.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{row.serviceAreas}</p>
                </div>
              ),
            },
            {
              key: "postal",
              header: "Postal Coverage",
              cell: (row) => <span className="font-mono text-xs">{row.postalCodes}</span>,
            },
            {
              key: "fee",
              header: "Fee (CAD)",
              cell: (row) => <span className="font-medium tabular-nums">${row.fee} CAD</span>,
            },
            {
              key: "min",
              header: "Min. Order",
              cell: (row) => <span className="tabular-nums">${row.minimumOrder} CAD</span>,
            },
            { key: "eta", header: "Est. Window", cell: (row) => row.eta },
            {
              key: "available",
              header: "Status",
              cell: (row) => (
                <Badge tone={row.available ? "success" : "neutral"} className="rounded-full">
                  {row.available ? "Active" : "Paused"}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              cell: (row) => (
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => openEditor(row)}>
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setPendingDelete(row)}>
                    Remove
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Section>

      {/* Delivery Time Windows & Handoff Instructions */}
      <Section
        title="Delivery Time Windows & Instructions"
        description="Define daily dispatch windows and standard patient/driver handoff instructions (including cold-chain & ID checks)."
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setInstructions(state.delivery.instructions);
                setTimeWindows(state.delivery.timeWindows);
              }}
            >
              Reset
            </Button>
            <Button type="button" size="sm" onClick={saveOperationsSettings}>
              Save settings
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="divide-y divide-line rounded-xl border border-line">
            {timeWindows.map((win) => (
              <div
                key={win.id}
                className="grid items-center gap-3 p-3.5 sm:grid-cols-[1fr_110px_130px_130px]"
              >
                <div className="flex items-center gap-2">
                  <Clock3 className={`h-4 w-4 ${win.enabled ? "text-[#1D9E75]" : "text-muted"}`} />
                  <span className="text-sm font-medium text-ink">{win.label}</span>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
                  <Switch
                    checked={win.enabled}
                    onCheckedChange={(enabled) => updateWindow(win.id, { enabled })}
                    aria-label={`Toggle ${win.label}`}
                  />
                  {win.enabled ? "Active" : "Off"}
                </label>
                <Input
                  type="time"
                  value={win.startTime}
                  disabled={!win.enabled}
                  aria-label={`${win.label} start time`}
                  onChange={(event) => updateWindow(win.id, { startTime: event.target.value })}
                />
                <Input
                  type="time"
                  value={win.endTime}
                  disabled={!win.enabled}
                  aria-label={`${win.label} end time`}
                  onChange={(event) => updateWindow(win.id, { endTime: event.target.value })}
                />
              </div>
            ))}
          </div>

          <Field
            label="Delivery Instructions"
            htmlFor="delivery-instructions"
            hint="Displayed on internal delivery manifests and patient delivery confirmations."
          >
            <Textarea
              id="delivery-instructions"
              rows={3}
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
            />
          </Field>
        </div>
      </Section>

      {/* Add/Edit Zone Dialog */}
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} title="Delivery Zone">
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit((values) => {
            saveZone(values);
            setEditing(null);
          })}
        >
          <Field label="Zone Name" error={form.formState.errors.name?.message}>
            <Input placeholder="e.g., Downtown Core" {...form.register("name")} />
          </Field>
          <Field
            label="Service Areas / Neighbourhoods"
            error={form.formState.errors.serviceAreas?.message}
          >
            <Input placeholder="e.g., King West, Financial District" {...form.register("serviceAreas")} />
          </Field>
          <Field
            label="Postal Code Coverage"
            hint="Separate Canadian FSA prefixes with commas (e.g., M5V, M5G, M5H)."
            error={form.formState.errors.postalCodes?.message}
          >
            <Input {...form.register("postalCodes")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Delivery Fee (CAD)" error={form.formState.errors.fee?.message}>
              <Input {...form.register("fee")} />
            </Field>
            <Field label="Minimum Order Amount (CAD)" error={form.formState.errors.minimumOrder?.message}>
              <Input {...form.register("minimumOrder")} />
            </Field>
          </div>
          <Field label="Estimated Delivery Window" error={form.formState.errors.eta?.message}>
            <Input placeholder="e.g., Same day (90–120 mins)" {...form.register("eta")} />
          </Field>
          <label className="flex items-center justify-between text-sm">
            Zone availability
            <Switch
              checked={Boolean(zoneAvailable)}
              onCheckedChange={(available) => form.setValue("available", available)}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit">Save zone</Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove delivery zone"
        description={
          pendingDelete ? `${pendingDelete.name} will be removed from this browser session.` : undefined
        }
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (pendingDelete) deleteZone(pendingDelete.id);
              setPendingDelete(null);
            }}
          >
            Remove
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
