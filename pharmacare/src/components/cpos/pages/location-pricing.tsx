"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/cpos/data-table";
import { Field, PageHeader, Section, Select } from "@/components/cpos/fields";
import { priceSchema } from "@/lib/cpos/schemas";
import { useCpos } from "@/lib/cpos/store";
import { createId } from "@/lib/utils";
import type { PriceRule } from "@/types/cpos";
import type { z } from "zod";

type PriceDraft = z.infer<typeof priceSchema>;

function money(value: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value);
}

export function LocationPricing() {
  const { state, savePrice, deletePrice } = useCpos();
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PriceRule | null>(null);
  const form = useForm<PriceDraft>({
    resolver: zodResolver(priceSchema),
    defaultValues: {
      id: "price-new",
      locationId: state.locations[0]?.id ?? "",
      product: "",
      defaultPrice: 12.99,
      overridePrice: null,
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
    },
  });

  function openEditor(rule?: PriceRule) {
    form.reset(
      rule
        ? rule
        : {
            id: createId("price"),
            locationId: state.locations[0]?.id ?? "",
            product: "",
            defaultPrice: 12.99,
            overridePrice: null,
            effectiveFrom: "2026-01-01",
            effectiveTo: "2026-12-31",
          },
    );
    setOpen(true);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Multi-Location Management"
        title="Location pricing"
        description="Default prices apply across the network. A location override is used only between its effective dates."
        actions={
          <Button type="button" onClick={() => openEditor()}>
            Add price rule
          </Button>
        }
      />
      <Section title="Pricing history">
        <DataTable
          rows={[...state.pricing].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))}
          getSearchText={(row) => row.product}
          columns={[
            {
              key: "location",
              header: "Location",
              cell: (row) => state.locations.find((location) => location.id === row.locationId)?.code ?? row.locationId,
            },
            { key: "product", header: "Item", cell: (row) => row.product },
            { key: "default", header: "Default price", cell: (row) => money(row.defaultPrice) },
            { key: "override", header: "Override", cell: (row) => (row.overridePrice === null ? "—" : money(row.overridePrice)) },
            { key: "from", header: "Effective from", cell: (row) => row.effectiveFrom },
            { key: "to", header: "Effective to", cell: (row) => row.effectiveTo },
            {
              key: "actions",
              header: "Actions",
              cell: (row) => (
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => openEditor(row)}>
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setPendingDelete(row)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Section>
      <Dialog open={open} onOpenChange={setOpen} title="Location-based price">
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit((values) => {
            savePrice(values);
            setOpen(false);
          })}
        >
          <Field label="Location">
            <Select {...form.register("locationId")}>
              {state.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.operatingName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Item" error={form.formState.errors.product?.message}>
            <Input {...form.register("product")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Default price" error={form.formState.errors.defaultPrice?.message}>
              <Input type="number" step="0.01" {...form.register("defaultPrice", { valueAsNumber: true })} />
            </Field>
            <Field label="Price override" hint="Leave blank to use the default.">
              <Input
                type="number"
                step="0.01"
                {...form.register("overridePrice", {
                  setValueAs: (value: string) => (value === "" ? null : Number(value)),
                })}
              />
            </Field>
            <Field label="Effective from" error={form.formState.errors.effectiveFrom?.message}>
              <Input type="date" {...form.register("effectiveFrom")} />
            </Field>
            <Field label="Effective to" error={form.formState.errors.effectiveTo?.message}>
              <Input type="date" {...form.register("effectiveTo")} />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save price</Button>
          </div>
        </form>
      </Dialog>
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(next) => !next && setPendingDelete(null)}
        title="Delete pricing rule"
        description="The rule will be removed from this session. Older history is not stored on a server."
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (pendingDelete) deletePrice(pendingDelete.id);
              setPendingDelete(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
