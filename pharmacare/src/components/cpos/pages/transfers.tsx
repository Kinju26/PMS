"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/cpos/data-table";
import { Field, PageHeader, Section, Select } from "@/components/cpos/fields";
import { StatusBadge, statusLabel } from "@/components/cpos/status-badge";
import { transferSchema } from "@/lib/cpos/schemas";
import { useCpos } from "@/lib/cpos/store";
import { createId } from "@/lib/utils";
import type { Transfer, TransferStatus } from "@/types/cpos";
import type { z } from "zod";

const statuses: TransferStatus[] = ["draft", "pending", "approved", "in-transit", "received", "cancelled"];
type TransferDraft = z.infer<typeof transferSchema>;

export function TransferList() {
  const { state } = useCpos();
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Multi-Location Management"
        title="Inter-store transfers"
        description="Move stock between branches. A transfer stays in this session until a backend is connected."
        actions={
          <Button asChild>
            <Link href="/locations/transfers/new">Create transfer</Link>
          </Button>
        }
      />
      <Section title="Transfers">
        <DataTable
          rows={state.transfers}
          getSearchText={(row) => `${row.reference} ${row.product} ${row.status}`}
          columns={[
            { key: "ref", header: "Reference", cell: (row) => row.reference },
            { key: "date", header: "Date", cell: (row) => row.date },
            {
              key: "source",
              header: "Source",
              cell: (row) => state.locations.find((location) => location.id === row.sourceId)?.code ?? row.sourceId,
            },
            {
              key: "destination",
              header: "Destination",
              cell: (row) => state.locations.find((location) => location.id === row.destinationId)?.code ?? row.destinationId,
            },
            { key: "product", header: "Product", cell: (row) => row.product },
            { key: "qty", header: "Quantity", cell: (row) => row.quantity },
            { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
            { key: "by", header: "Created by", cell: (row) => row.createdBy },
            {
              key: "actions",
              header: "Actions",
              cell: (row) => (
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/locations/transfers/${row.id}`}>View</Link>
                </Button>
              ),
            },
          ]}
        />
      </Section>
    </div>
  );
}

export function TransferForm() {
  const router = useRouter();
  const { state, saveTransfer } = useCpos();
  const form = useForm<TransferDraft>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      id: "tr-new",
      reference: "TR-1062",
      sourceId: state.locations[0]?.id ?? "",
      destinationId: state.locations[1]?.id ?? "",
      date: "2026-11-17",
      product: "",
      quantity: 1,
      status: "draft",
      createdBy: "Amrita Shah",
      notes: "",
    },
  });

  return (
    <form
      className="mx-auto max-w-3xl"
      onSubmit={form.handleSubmit((values) => {
        const id = values.id === "tr-new" ? createId("tr") : values.id;
        saveTransfer({ ...values, id });
        router.push(`/locations/transfers/${id}`);
      })}
    >
      <PageHeader
        eyebrow="Inter-store transfers"
        title="Create transfer"
        description="Choose the branches, the product, and the starting status."
      />
      <Section title="Transfer details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Transfer reference number" error={form.formState.errors.reference?.message}>
            <Input {...form.register("reference")} />
          </Field>
          <Field label="Transfer date" error={form.formState.errors.date?.message}>
            <Input type="date" {...form.register("date")} />
          </Field>
          <Field label="Source location" error={form.formState.errors.sourceId?.message}>
            <Select {...form.register("sourceId")}>
              {state.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.operatingName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Destination location" error={form.formState.errors.destinationId?.message}>
            <Select {...form.register("destinationId")}>
              {state.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.operatingName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Medication / product" error={form.formState.errors.product?.message} className="md:col-span-2">
            <Input {...form.register("product")} />
          </Field>
          <Field label="Quantity" error={form.formState.errors.quantity?.message}>
            <Input type="number" min={1} {...form.register("quantity", { valueAsNumber: true })} />
          </Field>
          <Field label="Transfer status">
            <Select {...form.register("status")}>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Created by" className="md:col-span-2">
            <Input {...form.register("createdBy")} />
          </Field>
          <Field label="Notes" className="md:col-span-2">
            <Textarea {...form.register("notes")} />
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => router.push("/locations/transfers")}>
            Cancel
          </Button>
          <Button type="submit">Save transfer</Button>
        </div>
      </Section>
    </form>
  );
}

export function TransferDetail({ id }: { id: string }) {
  const { state, setTransferStatus } = useCpos();
  const transfer = state.transfers.find((item) => item.id === id);
  if (!transfer) {
    return <PageHeader title="Transfer not found" description="This reference is not in the current session." />;
  }
  const source = state.locations.find((location) => location.id === transfer.sourceId);
  const destination = state.locations.find((location) => location.id === transfer.destinationId);
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        eyebrow={transfer.reference}
        title={transfer.product}
        description={`${transfer.quantity} units · created by ${transfer.createdBy} on ${transfer.date}`}
        actions={
          <Button asChild variant="secondary">
            <Link href="/locations/transfers">All transfers</Link>
          </Button>
        }
      />
      <Section title="Transfer details">
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">Source location</dt>
            <dd className="font-medium">{source?.operatingName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Destination location</dt>
            <dd className="font-medium">{destination?.operatingName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={transfer.status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Notes</dt>
            <dd>{transfer.notes || "None"}</dd>
          </div>
        </dl>
        <label className="mt-4 block text-sm">
          Update status
          <Select
            className="mt-1.5 max-w-xs"
            value={transfer.status}
            onChange={(event) => setTransferStatus(transfer.id, event.target.value as Transfer["status"])}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </Select>
        </label>
      </Section>
    </div>
  );
}
