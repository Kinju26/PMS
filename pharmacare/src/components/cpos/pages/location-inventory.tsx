"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/cpos/data-table";
import { PageHeader, Section, Select } from "@/components/cpos/fields";
import { StatusBadge } from "@/components/cpos/status-badge";
import { useCpos } from "@/lib/cpos/store";
import type { InventoryItem, StockStatus, TransferPolicy } from "@/types/cpos";

function stockStatus(onHand: number, reorderPoint: number): StockStatus {
  if (onHand <= 0) return "out";
  if (onHand <= reorderPoint) return "low";
  return "healthy";
}

export function LocationInventory() {
  const { state, saveInventoryItem, saveTransferPolicy } = useCpos();
  const [locationId, setLocationId] = useState("all");
  const [policy, setPolicy] = useState<TransferPolicy>(state.transferPolicy);
  const rows = useMemo(
    () => state.inventory.filter((item) => locationId === "all" || item.locationId === locationId),
    [locationId, state.inventory],
  );

  function saveRow(item: InventoryItem, onHand: number) {
    saveInventoryItem({ ...item, onHand, status: stockStatus(onHand, item.reorderPoint) });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        eyebrow="Multi-Location Management"
        title="Location inventory"
        description="On-hand stock by branch, plus the rules that govern movement between locations."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Lines shown", rows.length],
          ["Below reorder", rows.filter((row) => row.status !== "healthy").length],
          ["Units on hand", rows.reduce((sum, row) => sum + row.onHand, 0)],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border border-line bg-white px-4 py-3">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <Section
        title="Stock availability"
        action={
          <Select value={locationId} onChange={(event) => setLocationId(event.target.value)} aria-label="Filter by location" className="w-56">
            <option value="all">All locations</option>
            {state.locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.operatingName}
              </option>
            ))}
          </Select>
        }
      >
        <DataTable
          rows={rows}
          getSearchText={(row) => `${row.product} ${row.din}`}
          columns={[
            {
              key: "location",
              header: "Location",
              cell: (row) => state.locations.find((location) => location.id === row.locationId)?.code ?? row.locationId,
            },
            { key: "product", header: "Product", cell: (row) => row.product },
            { key: "din", header: "DIN", cell: (row) => row.din },
            { key: "onHand", header: "On hand", cell: (row) => <StockEditor item={row} onSave={saveRow} /> },
            { key: "reorder", header: "Reorder point", cell: (row) => row.reorderPoint },
            { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
      </Section>
      <Section title="Inventory transfer configuration" description="These rules apply when stock moves between branches.">
        <div className="space-y-4">
          <label className="flex items-center justify-between text-sm">
            Allow location-based stock transfers
            <Switch checked={policy.enabled} onCheckedChange={(enabled) => setPolicy((current) => ({ ...current, enabled }))} />
          </label>
          <label className="flex items-center justify-between text-sm">
            Require approval before a transfer leaves the source
            <Switch checked={policy.requireApproval} onCheckedChange={(requireApproval) => setPolicy((current) => ({ ...current, requireApproval }))} />
          </label>
          <label className="flex items-center justify-between text-sm">
            Allow partial receipt
            <Switch checked={policy.allowPartialReceipt} onCheckedChange={(allowPartialReceipt) => setPolicy((current) => ({ ...current, allowPartialReceipt }))} />
          </label>
          <Button type="button" onClick={() => saveTransferPolicy(policy)}>
            Save transfer policy
          </Button>
        </div>
      </Section>
    </div>
  );
}

function StockEditor({ item, onSave }: { item: InventoryItem; onSave: (item: InventoryItem, onHand: number) => void }) {
  const [value, setValue] = useState(String(item.onHand));
  return (
    <div className="flex items-center gap-2">
      <Input className="h-8 w-20" value={value} onChange={(event) => setValue(event.target.value)} inputMode="numeric" />
      <Button type="button" size="sm" variant="secondary" onClick={() => onSave(item, Number(value) || 0)}>
        Update
      </Button>
    </div>
  );
}
