"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState, Field, PageHeader, Section, Select } from "@/components/cpos/fields";
import { UnsavedChangesBar } from "@/components/cpos/unsaved-bar";
import { PROVINCES, PROVINCE_REGULATORY_PRESETS, provinceName } from "@/lib/cpos/constants";
import { regulatorySchema } from "@/lib/cpos/schemas";
import { useCpos } from "@/lib/cpos/store";
import { createId } from "@/lib/utils";
import type { Province, RegulatoryIdentifierItem } from "@/types/cpos";
import type { z } from "zod";

type RegulatoryFormValues = z.infer<typeof regulatorySchema>;

export function RegulatoryConfiguration() {
  const { state, saveRegulatory } = useCpos();
  const [additionalIds, setAdditionalIds] = useState<RegulatoryIdentifierItem[]>(
    state.regulatory.additionalIdentifiers,
  );
  const [idsDirty, setIdsDirty] = useState(false);

  const [editingId, setEditingId] = useState<RegulatoryIdentifierItem | null>(null);
  const [idLabel, setIdLabel] = useState("");
  const [idValue, setIdValue] = useState("");
  const [idNotes, setIdNotes] = useState("");
  const [idError, setIdError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<RegulatoryIdentifierItem | null>(null);

  const form = useForm<RegulatoryFormValues>({
    resolver: zodResolver(regulatorySchema),
    defaultValues: {
      province: state.regulatory.province,
      regulatoryAuthority: state.regulatory.regulatoryAuthority,
      pharmacyLicenceNumber: state.regulatory.pharmacyLicenceNumber,
      primaryIdentifier: state.regulatory.primaryIdentifier,
    },
  });

  const selectedProvince = (useWatch({ control: form.control, name: "province" }) ??
    state.regulatory.province) as Province;
  const preset = PROVINCE_REGULATORY_PRESETS[selectedProvince];
  const isDirty = form.formState.isDirty || idsDirty;

  function handleProvinceChange(nextProvince: Province) {
    form.setValue("province", nextProvince, { shouldDirty: true, shouldValidate: true });
    const nextPreset = PROVINCE_REGULATORY_PRESETS[nextProvince];
    if (nextPreset) {
      form.setValue("regulatoryAuthority", nextPreset.authority, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  function onSubmit(values: RegulatoryFormValues) {
    saveRegulatory({
      ...values,
      additionalIdentifiers: additionalIds,
    });
    form.reset(values);
    setIdsDirty(false);
  }

  function resetAll() {
    form.reset({
      province: state.regulatory.province,
      regulatoryAuthority: state.regulatory.regulatoryAuthority,
      pharmacyLicenceNumber: state.regulatory.pharmacyLicenceNumber,
      primaryIdentifier: state.regulatory.primaryIdentifier,
    });
    setAdditionalIds(state.regulatory.additionalIdentifiers);
    setIdsDirty(false);
  }

  function openIdentifierDialog(item?: RegulatoryIdentifierItem, suggestedLabel?: string) {
    if (item) {
      setEditingId(item);
      setIdLabel(item.label);
      setIdValue(item.value);
      setIdNotes(item.notes);
    } else {
      setEditingId({ id: createId("reg"), label: "", value: "", notes: "" });
      setIdLabel(suggestedLabel ?? "");
      setIdValue("");
      setIdNotes("");
    }
    setIdError("");
  }

  function commitIdentifier() {
    if (!editingId) return;
    if (idLabel.trim().length < 2 || idValue.trim().length < 2) {
      setIdError("Enter both an identifier label and value.");
      return;
    }
    const nextRecord: RegulatoryIdentifierItem = {
      id: editingId.id,
      label: idLabel.trim(),
      value: idValue.trim(),
      notes: idNotes.trim(),
    };
    setAdditionalIds((prev) =>
      prev.some((row) => row.id === nextRecord.id)
        ? prev.map((row) => (row.id === nextRecord.id ? nextRecord : row))
        : [...prev, nextRecord],
    );
    setIdsDirty(true);
    setEditingId(null);
  }

  function removeIdentifier(id: string) {
    setAdditionalIds((prev) => prev.filter((row) => row.id !== id));
    setIdsDirty(true);
    setPendingDelete(null);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        eyebrow="Phase 0 · Pharmacy Configuration"
        title="Regulatory Configuration"
        description="Configure provincial pharmacy licensing, regulatory authority references, and jurisdiction-specific billing or facility identifiers."
        status={
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="brand">{provinceName(selectedProvince)}</Badge>
            <Badge tone="neutral">Demonstration Data</Badge>
          </div>
        }
        actions={
          <>
            <Button type="button" variant="secondary" onClick={resetAll} disabled={!isDirty}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </>
        }
      />

      <UnsavedChangesBar
        dirty={isDirty}
        onDiscard={resetAll}
        saveType="submit"
        saveLabel="Save Changes"
      />

      <Section
        title="Jurisdiction & Primary Licensing"
        description="Changing the province pre-fills the corresponding provincial pharmacy authority, which remains fully editable."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Province / Territory"
            htmlFor="reg-province"
            required
            error={form.formState.errors.province?.message}
          >
            <Select
              id="reg-province"
              value={selectedProvince}
              onChange={(event) => handleProvinceChange(event.target.value as Province)}
            >
              {PROVINCES.map((prov) => (
                <option key={prov.code} value={prov.code}>
                  {prov.name} ({prov.code})
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Regulatory Authority"
            htmlFor="reg-authority"
            required
            hint="Editable based on your provincial college or territorial registrar."
            error={form.formState.errors.regulatoryAuthority?.message}
          >
            <Input id="reg-authority" {...form.register("regulatoryAuthority")} />
          </Field>

          <Field
            label="Pharmacy Licence Number"
            htmlFor="reg-licence"
            required
            error={form.formState.errors.pharmacyLicenceNumber?.message}
          >
            <Input
              id="reg-licence"
              placeholder="e.g., OCP-ACC-308412"
              {...form.register("pharmacyLicenceNumber")}
            />
          </Field>

          <Field
            label="Regulatory Identifiers"
            htmlFor="reg-primary"
            required
            hint="Primary facility, accreditation, or tax registration numbers."
            error={form.formState.errors.primaryIdentifier?.message}
          >
            <Input id="reg-primary" {...form.register("primaryIdentifier")} />
          </Field>
        </div>
      </Section>

      {/* Dynamic Jurisdiction-Specific Identifiers */}
      <Section
        title="Additional Jurisdiction-Specific Identifiers"
        description={`Add or maintain configurable identifiers required for ${provinceName(selectedProvince)} claims, provincial drug networks, or inspections.`}
        action={
          <Button type="button" size="sm" onClick={() => openIdentifierDialog()}>
            <Plus className="h-3.5 w-3.5" />
            Add Identifier
          </Button>
        }
      >
        {preset?.identifierExamples?.length ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-muted">Quick-add templates for {selectedProvince}:</span>
            {preset.identifierExamples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => openIdentifierDialog(undefined, example)}
                className="rounded border border-[#DCE3EA] bg-[#F8FAFC] px-2 py-1 text-xs font-medium text-ink transition hover:border-[#087f8c] hover:text-[#087f8c]"
              >
                + {example}
              </button>
            ))}
          </div>
        ) : null}

        {additionalIds.length === 0 ? (
          <EmptyState
            title="No additional identifiers configured"
            body="Add provincial billing numbers, drug network site IDs, or accreditation references as needed."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#DCE3EA]">
            <table className="w-full min-w-[540px] text-left text-xs">
              <thead className="border-b border-[#E6ECF1] bg-[#F8FAFC] text-[11px] font-semibold text-muted uppercase">
                <tr>
                  <th className="px-3.5 py-2.5">Identifier Type</th>
                  <th className="px-3.5 py-2.5">Identifier Value</th>
                  <th className="px-3.5 py-2.5">Notes</th>
                  <th className="px-3.5 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F6] bg-white">
                {additionalIds.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-3.5 py-3 font-semibold text-ink">{row.label}</td>
                    <td className="px-3.5 py-3 font-mono text-ink">{row.value}</td>
                    <td className="px-3.5 py-3 text-muted">{row.notes || "—"}</td>
                    <td className="px-3.5 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => openIdentifierDialog(row)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={`Delete ${row.label}`}
                          onClick={() => setPendingDelete(row)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Add/Edit Identifier Dialog */}
      <Dialog
        open={editingId !== null}
        onOpenChange={(open) => !open && setEditingId(null)}
        title="Jurisdiction Identifier"
        description="Define a custom identifier label and value for this pharmacy."
      >
        <div className="grid gap-4">
          <Field label="Identifier Label" required>
            <Input
              value={idLabel}
              onChange={(event) => setIdLabel(event.target.value)}
              placeholder="e.g., ODB Billing ID or PharmaNet Site ID"
            />
          </Field>
          <Field label="Identifier Value" required>
            <Input
              value={idValue}
              onChange={(event) => setIdValue(event.target.value)}
              placeholder="e.g., ODB-0048291"
            />
          </Field>
          <Field label="Notes (Optional)">
            <Input
              value={idNotes}
              onChange={(event) => setIdNotes(event.target.value)}
              placeholder="Internal reference note"
            />
          </Field>
          {idError ? <p className="text-xs font-medium text-red-700">{idError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={commitIdentifier}>
              Apply Identifier
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete regulatory identifier?"
        description={
          pendingDelete
            ? `Remove "${pendingDelete.label}" (${pendingDelete.value}) from this configuration? Remember to click Save Changes afterward.`
            : undefined
        }
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => pendingDelete && removeIdentifier(pendingDelete.id)}
          >
            Delete Identifier
          </Button>
        </div>
      </Dialog>
    </form>
  );
}

