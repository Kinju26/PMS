"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, Plus, Trash2, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/cpos/data-table";
import { Field, PageHeader, Section, Select } from "@/components/cpos/fields";
import { UnsavedChangesBar } from "@/components/cpos/unsaved-bar";
import { picAssignmentSchema } from "@/lib/cpos/schemas";
import { useCpos } from "@/lib/cpos/store";
import { createId } from "@/lib/utils";
import type { PicAssignment, PicAssignmentStatus } from "@/types/cpos";
import type { z } from "zod";

type PicFormValues = z.infer<typeof picAssignmentSchema>;

const statusTone: Record<PicAssignmentStatus, "success" | "warning" | "neutral"> = {
  active: "success",
  scheduled: "warning",
  ended: "neutral",
};

const blankAssignment = (): PicFormValues => ({
  id: createId("pic"),
  pharmacistName: "",
  registrationNumber: "",
  phone: "",
  email: "",
  effectiveStartDate: new Date().toISOString().slice(0, 10),
  effectiveEndDate: "",
  status: "active",
  notes: "",
});

export function PharmacistInChargePageView() {
  const { state, savePicAssignment, deletePicAssignment } = useCpos();
  const [statusFilter, setStatusFilter] = useState<"all" | PicAssignmentStatus>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PicAssignment | null>(null);

  const activePic = state.picAssignments.find((item) => item.status === "active") ?? null;

  // Inline edit form for the active PIC
  const inlineDefaults: PicFormValues = activePic ?? blankAssignment();
  const inlineForm = useForm<PicFormValues>({
    resolver: zodResolver(picAssignmentSchema),
    defaultValues: inlineDefaults,
  });

  // Modal form for assigning a new PIC or editing any history record
  const modalForm = useForm<PicFormValues>({
    resolver: zodResolver(picAssignmentSchema),
    defaultValues: blankAssignment(),
  });

  function openModal(record?: PicAssignment) {
    modalForm.reset(record ?? blankAssignment());
    setModalOpen(true);
  }

  function handleInlineSubmit(values: PicFormValues) {
    savePicAssignment(values);
    inlineForm.reset(values);
  }

  const filteredHistory = useMemo(() => {
    return state.picAssignments
      .filter((row) => statusFilter === "all" || row.status === statusFilter)
      .sort((a, b) => b.effectiveStartDate.localeCompare(a.effectiveStartDate));
  }, [state.picAssignments, statusFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        eyebrow="Phase 0 · Pharmacy Configuration"
        title="Pharmacist-in-Charge"
        description="Assign and maintain the Designated Manager / Pharmacist-in-Charge responsible for pharmacy oversight, along with full historical assignment records."
        status={
          <div className="flex items-center gap-1.5">
            <Badge tone={activePic ? "success" : "danger"}>
              {activePic ? "Active Assignment" : "Unassigned"}
            </Badge>
            <Badge tone="neutral">Demonstration Data</Badge>
          </div>
        }
        actions={
          <Button type="button" onClick={() => openModal()}>
            <Plus className="h-4 w-4" />
            New PIC Assignment
          </Button>
        }
      />

      <UnsavedChangesBar
        dirty={inlineForm.formState.isDirty}
        onDiscard={() => inlineForm.reset(inlineDefaults)}
        onSave={inlineForm.handleSubmit(handleInlineSubmit)}
        saveLabel="Save Changes"
      />

      {/* Current Active Pharmacist-in-Charge Form */}
      <form onSubmit={inlineForm.handleSubmit(handleInlineSubmit)}>
        <Section
          title="Current Pharmacist-in-Charge Assignment"
          description="Edit details for the currently active Designated Manager. Assigning a new active PIC automatically transitions the previous assignment to Ended."
          action={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!inlineForm.formState.isDirty}
                onClick={() => inlineForm.reset(inlineDefaults)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Changes
              </Button>
            </div>
          }
        >
          {activePic ? (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#DCE3EA] bg-[#F8FAFC] p-3.5 text-xs">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#087f8c] text-white">
                  <UserCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{activePic.pharmacistName}</p>
                  <p className="font-mono text-muted">{activePic.registrationNumber}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#087f8c]" />
                  {activePic.phone}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#087f8c]" />
                  {activePic.email}
                </span>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Pharmacist Name"
              htmlFor="pic-name"
              required
              error={inlineForm.formState.errors.pharmacistName?.message}
            >
              <Input id="pic-name" {...inlineForm.register("pharmacistName")} />
            </Field>
            <Field
              label="Registration Number"
              htmlFor="pic-reg"
              required
              hint="Provincial college registration / licence number"
              error={inlineForm.formState.errors.registrationNumber?.message}
            >
              <Input id="pic-reg" {...inlineForm.register("registrationNumber")} />
            </Field>
            <Field
              label="Contact Phone"
              htmlFor="pic-phone"
              required
              error={inlineForm.formState.errors.phone?.message}
            >
              <Input id="pic-phone" {...inlineForm.register("phone")} />
            </Field>
            <Field
              label="Contact Email"
              htmlFor="pic-email"
              required
              error={inlineForm.formState.errors.email?.message}
            >
              <Input id="pic-email" type="email" {...inlineForm.register("email")} />
            </Field>
            <Field
              label="Effective Start Date"
              htmlFor="pic-start"
              required
              error={inlineForm.formState.errors.effectiveStartDate?.message}
            >
              <Input id="pic-start" type="date" {...inlineForm.register("effectiveStartDate")} />
            </Field>
            <Field
              label="Effective End Date"
              htmlFor="pic-end"
              hint="Leave blank while assignment remains active"
              error={inlineForm.formState.errors.effectiveEndDate?.message}
            >
              <Input id="pic-end" type="date" {...inlineForm.register("effectiveEndDate")} />
            </Field>
            <Field label="Assignment Status" htmlFor="pic-status" required>
              <Select id="pic-status" {...inlineForm.register("status")}>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="ended">Ended</option>
              </Select>
            </Field>
            <Field label="Assignment Notes" htmlFor="pic-notes">
              <Input id="pic-notes" {...inlineForm.register("notes")} />
            </Field>
          </div>
        </Section>
      </form>

      {/* Assignment History Table */}
      <Section
        title="Assignment History"
        description="Chronological record of active, scheduled, and past Pharmacist-in-Charge appointments."
      >
        <DataTable
          rows={filteredHistory}
          searchPlaceholder="Search pharmacist name, registration #, or email..."
          getSearchText={(row) =>
            `${row.pharmacistName} ${row.registrationNumber} ${row.email} ${row.status}`
          }
          toolbar={
            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | PicAssignmentStatus)
              }
              aria-label="Filter assignment history by status"
              className="h-10 w-full sm:w-40"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="ended">Ended</option>
            </Select>
          }
          columns={[
            {
              key: "name",
              header: "Pharmacist Name",
              cell: (row) => (
                <div>
                  <p className="font-semibold text-ink">{row.pharmacistName}</p>
                  <p className="text-xs text-muted">{row.notes || "—"}</p>
                </div>
              ),
            },
            {
              key: "reg",
              header: "Registration #",
              cell: (row) => <span className="font-mono text-xs">{row.registrationNumber}</span>,
            },
            {
              key: "contact",
              header: "Contact Information",
              cell: (row) => (
                <div className="text-xs">
                  <p>{row.phone}</p>
                  <p className="text-muted">{row.email}</p>
                </div>
              ),
            },
            {
              key: "dates",
              header: "Effective Dates",
              cell: (row) => (
                <span className="font-mono text-xs tabular-nums">
                  {row.effectiveStartDate} → {row.effectiveEndDate || "Present"}
                </span>
              ),
            },
            {
              key: "status",
              header: "Assignment Status",
              cell: (row) => (
                <Badge tone={statusTone[row.status]} className="capitalize">
                  {row.status}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              cell: (row) => (
                <div className="flex gap-1.5">
                  <Button type="button" size="sm" variant="secondary" onClick={() => openModal(row)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete ${row.pharmacistName}`}
                    onClick={() => setPendingDelete(row)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Section>

      {/* New / Edit PIC Assignment Dialog */}
      <Dialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Pharmacist-in-Charge Assignment"
        description="Setting status to Active will automatically mark any previous active assignment as Ended."
        className="w-[min(600px,calc(100%-2rem))]"
      >
        <form
          className="grid gap-4"
          onSubmit={modalForm.handleSubmit((values) => {
            savePicAssignment(values);
            if (values.status === "active") {
              inlineForm.reset(values);
            }
            setModalOpen(false);
          })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Pharmacist Name"
              required
              error={modalForm.formState.errors.pharmacistName?.message}
            >
              <Input {...modalForm.register("pharmacistName")} />
            </Field>
            <Field
              label="Registration Number"
              required
              error={modalForm.formState.errors.registrationNumber?.message}
            >
              <Input {...modalForm.register("registrationNumber")} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact Phone" required error={modalForm.formState.errors.phone?.message}>
              <Input {...modalForm.register("phone")} />
            </Field>
            <Field label="Contact Email" required error={modalForm.formState.errors.email?.message}>
              <Input type="email" {...modalForm.register("email")} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Start Date"
              required
              error={modalForm.formState.errors.effectiveStartDate?.message}
            >
              <Input type="date" {...modalForm.register("effectiveStartDate")} />
            </Field>
            <Field
              label="End Date"
              error={modalForm.formState.errors.effectiveEndDate?.message}
            >
              <Input type="date" {...modalForm.register("effectiveEndDate")} />
            </Field>
            <Field label="Status" required>
              <Select {...modalForm.register("status")}>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="ended">Ended</option>
              </Select>
            </Field>
          </div>
          <Field label="Notes">
            <Textarea rows={2} {...modalForm.register("notes")} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Assignment</Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete PIC assignment record?"
        description={
          pendingDelete
            ? `Remove the assignment record for ${pendingDelete.pharmacistName} (${pendingDelete.registrationNumber})?`
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
            onClick={() => {
              if (pendingDelete) deletePicAssignment(pendingDelete.id);
              setPendingDelete(null);
            }}
          >
            Delete Record
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

