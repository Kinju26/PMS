"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Section, Select } from "@/components/cpos/fields";
import { useCpos } from "@/lib/cpos/store";

const ranges = [
  { id: "7", label: "Last 7 days", factor: 0.25 },
  { id: "30", label: "Last 30 days", factor: 1 },
  { id: "90", label: "Last quarter", factor: 2.4 },
] as const;

export function ConsolidatedReporting() {
  const { state } = useCpos();
  const [range, setRange] = useState<(typeof ranges)[number]["id"]>("30");
  const [locationId, setLocationId] = useState("all");
  const factor = ranges.find((item) => item.id === range)?.factor ?? 1;

  const rows = useMemo(() => {
    return state.sales
      .filter((point) => locationId === "all" || point.locationId === locationId)
      .map((point) => {
        const location = state.locations.find((item) => item.id === point.locationId);
        return {
          name: location?.code ?? point.locationId,
          sales: Math.round(point.sales * factor),
          transfers: Math.round(point.transfers * factor),
        };
      });
  }, [factor, locationId, state.locations, state.sales]);

  const inventoryUnits = state.inventory
    .filter((item) => locationId === "all" || item.locationId === locationId)
    .reduce((sum, item) => sum + item.onHand, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        eyebrow="Multi-Location Management"
        title="Consolidated reporting"
        description="Sample comparisons for the selected range. These figures are not loaded from a sales or inventory system."
        actions={
          <div className="flex gap-2">
            <Select value={range} onChange={(event) => setRange(event.target.value as typeof range)} aria-label="Date range">
              {ranges.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
            <Select value={locationId} onChange={(event) => setLocationId(event.target.value)} aria-label="Location filter">
              <option value="all">All locations</option>
              {state.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.operatingName}
                </option>
              ))}
            </Select>
          </div>
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Sales summary", rows.reduce((sum, row) => sum + row.sales, 0).toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })],
          ["Transfer summary", String(rows.reduce((sum, row) => sum + row.transfers, 0))],
          ["Inventory summary", `${inventoryUnits.toLocaleString("en-CA")} units`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line bg-white px-4 py-3">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <Section title="Location-wise comparison">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <CartesianGrid stroke="#e3e8e6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#5d6b76" }} />
              <YAxis tick={{ fontSize: 12, fill: "#5d6b76" }} />
              <Tooltip />
              <Bar dataKey="sales" name="Sample sales" fill="#1D9E75" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>
    </div>
  );
}
