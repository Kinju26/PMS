"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/cpos/data-table";
import { Field, PageHeader, Section, Select } from "@/components/cpos/fields";
import { LocationOverview } from "@/components/cpos/pages/location-overview";
import { NotificationConfiguration } from "@/components/cpos/pages/notification-configuration";
import { StatusBadge } from "@/components/cpos/status-badge";
import { PROVINCES, provinceName } from "@/lib/cpos/constants";
import { useCpos } from "@/lib/cpos/store";
import { createId } from "@/lib/utils";
import type {
  DepartmentItem,
  PaymentMethodItem,
  PrescriptionStatusItem,
  Province,
  ReferenceDataCategory,
  ReferenceDataItem,
  TaxRuleItem,
} from "@/types/cpos";

function BackBreadcrumb({ current }: { current: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-xs text-muted">
      <Link
        href="/configuration/master"
        className="inline-flex items-center gap-1 font-semibold text-[#087f8c] hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Master Configuration
      </Link>
      <span>/</span>
      <span className="font-medium text-ink">{current}</span>
    </div>
  );
}

function DepartmentsView() {
  const { state, saveDepartment, deleteDepartment } = useCpos();
  const [editing, setEditing] = useState<DepartmentItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DepartmentItem | null>(null);
  const [error, setError] = useState("");

  function openEditor(item?: DepartmentItem) {
    setEditing(
      item ?? {
        id: createId("dept"),
        code: "",
        name: "",
        lead: "",
        description: "",
        status: "active",
      },
    );
    setError("");
  }

  function submit() {
    if (!editing) return;
    if (editing.code.trim().length < 2 || editing.name.trim().length < 2) {
      setError("Enter both a department code and name.");
      return;
    }
    saveDepartment({ ...editing, code: editing.code.trim().toUpperCase(), name: editing.name.trim() });
    setEditing(null);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <BackBreadcrumb current="Departments" />
      <PageHeader
        eyebrow="Master Configuration"
        title="Departments"
        description="Define pharmacy operational departments for workflow routing, staffing assignments, and reporting."
        status={<Badge tone="neutral">Demonstration Data</Badge>}
        actions={
          <Button type="button" onClick={() => openEditor()}>
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        }
      />

      <Section title="Configured Departments">
        <DataTable
          rows={state.masterConfig.departments}
          searchPlaceholder="Search department code, name, or lead..."
          getSearchText={(row) => `${row.code} ${row.name} ${row.lead} ${row.description}`}
          columns={[
            { key: "code", header: "Code", cell: (row) => <span className="font-mono font-semibold">{row.code}</span> },
            {
              key: "name",
              header: "Department",
              cell: (row) => (
                <div>
                  <p className="font-semibold text-ink">{row.name}</p>
                  <p className="text-xs text-muted">{row.description}</p>
                </div>
              ),
            },
            { key: "lead", header: "Department Lead", cell: (row) => row.lead || "Unassigned" },
            { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
            {
              key: "actions",
              header: "Actions",
              cell: (row) => (
                <div className="flex gap-1.5">
                  <Button type="button" size="sm" variant="secondary" onClick={() => openEditor(row)}>
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setPendingDelete(row)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Section>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} title="Department">
        {editing ? (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Department Code" required>
                <Input
                  value={editing.code}
                  placeholder="e.g., DISP"
                  onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                />
              </Field>
              <Field label="Status" required>
                <Select
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({ ...editing, status: e.target.value as "active" | "inactive" })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>
            </div>
            <Field label="Department Name" required>
              <Input
                value={editing.name}
                placeholder="e.g., Non-Sterile Compounding"
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </Field>
            <Field label="Department Lead">
              <Input
                value={editing.lead}
                onChange={(e) => setEditing({ ...editing, lead: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <Input
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </Field>
            {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={submit}>
                Save Department
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete department?"
        description={pendingDelete ? `Remove "${pendingDelete.name}" (${pendingDelete.code})?` : undefined}
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (pendingDelete) deleteDepartment(pendingDelete.id);
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

function PrescriptionStatusesView() {
  const { state, savePrescriptionStatus, deletePrescriptionStatus } = useCpos();
  const [editing, setEditing] = useState<PrescriptionStatusItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PrescriptionStatusItem | null>(null);
  const [stageFilter, setStageFilter] = useState("all");
  const [error, setError] = useState("");

  const rows = useMemo(
    () =>
      [...state.masterConfig.prescriptionStatuses]
        .filter((s) => stageFilter === "all" || s.stage === stageFilter)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [stageFilter, state.masterConfig.prescriptionStatuses],
  );

  function openEditor(item?: PrescriptionStatusItem) {
    setEditing(
      item ?? {
        id: createId("rxs"),
        code: "",
        label: "",
        stage: "Dispensing",
        tone: "brand",
        sortOrder: state.masterConfig.prescriptionStatuses.length + 1,
        active: true,
      },
    );
    setError("");
  }

  function submit() {
    if (!editing) return;
    if (editing.code.trim().length < 2 || editing.label.trim().length < 2) {
      setError("Enter both a short code and status label.");
      return;
    }
    savePrescriptionStatus({
      ...editing,
      code: editing.code.trim().toUpperCase(),
      label: editing.label.trim(),
    });
    setEditing(null);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <BackBreadcrumb current="Prescription Status Settings" />
      <PageHeader
        eyebrow="Master Configuration"
        title="Prescription Status Settings"
        description="Configure workflow statuses and stage ordering used across prescription intake, verification, dispensing, and release."
        status={<Badge tone="neutral">Demonstration Data</Badge>}
        actions={
          <Button type="button" onClick={() => openEditor()}>
            <Plus className="h-4 w-4" />
            Add Status
          </Button>
        }
      />

      <Section title="Workflow Queue Statuses">
        <DataTable
          rows={rows}
          pageSize={12}
          searchPlaceholder="Search code, label, or stage..."
          getSearchText={(row) => `${row.code} ${row.label} ${row.stage}`}
          toolbar={
            <Select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              aria-label="Filter by workflow stage"
              className="h-10 w-full sm:w-44"
            >
              <option value="all">All stages</option>
              <option value="Intake">Intake</option>
              <option value="Clinical">Clinical</option>
              <option value="Dispensing">Dispensing</option>
              <option value="Release">Release</option>
              <option value="Exception">Exception</option>
            </Select>
          }
          columns={[
            { key: "order", header: "Order", cell: (row) => <span className="font-mono">{row.sortOrder}</span> },
            { key: "code", header: "Code", cell: (row) => <span className="font-mono font-semibold">{row.code}</span> },
            {
              key: "label",
              header: "Status Label",
              cell: (row) => <Badge tone={row.tone}>{row.label}</Badge>,
            },
            { key: "stage", header: "Workflow Stage", cell: (row) => row.stage },
            {
              key: "active",
              header: "Active",
              cell: (row) => (
                <Switch
                  checked={row.active}
                  aria-label={`Toggle ${row.label}`}
                  onCheckedChange={(active) => savePrescriptionStatus({ ...row, active })}
                />
              ),
            },
            {
              key: "actions",
              header: "Actions",
              cell: (row) => (
                <div className="flex gap-1.5">
                  <Button type="button" size="sm" variant="secondary" onClick={() => openEditor(row)}>
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setPendingDelete(row)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Section>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} title="Prescription Status">
        {editing ? (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status Code" required>
                <Input
                  value={editing.code}
                  placeholder="e.g., VER"
                  onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                />
              </Field>
              <Field label="Sequence Order" required>
                <Input
                  type="number"
                  min={1}
                  value={editing.sortOrder}
                  onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) || 1 })}
                />
              </Field>
            </div>
            <Field label="Status Label" required>
              <Input
                value={editing.label}
                placeholder="e.g., Final Verification"
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Workflow Stage" required>
                <Select
                  value={editing.stage}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      stage: e.target.value as PrescriptionStatusItem["stage"],
                    })
                  }
                >
                  <option value="Intake">Intake</option>
                  <option value="Clinical">Clinical</option>
                  <option value="Dispensing">Dispensing</option>
                  <option value="Release">Release</option>
                  <option value="Exception">Exception</option>
                </Select>
              </Field>
              <Field label="Badge Style">
                <Select
                  value={editing.tone}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      tone: e.target.value as PrescriptionStatusItem["tone"],
                    })
                  }
                >
                  <option value="neutral">Neutral Grey</option>
                  <option value="brand">Teal Accent</option>
                  <option value="success">Green Success</option>
                  <option value="warning">Amber Attention</option>
                  <option value="danger">Red Exception</option>
                </Select>
              </Field>
            </div>
            {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={submit}>
                Save Status
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete prescription status?"
        description={pendingDelete ? `Remove "${pendingDelete.label}" (${pendingDelete.code})?` : undefined}
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (pendingDelete) deletePrescriptionStatus(pendingDelete.id);
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

function PaymentMethodsView() {
  const { state, savePaymentMethod, deletePaymentMethod } = useCpos();
  const [editing, setEditing] = useState<PaymentMethodItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PaymentMethodItem | null>(null);
  const [error, setError] = useState("");

  function openEditor(item?: PaymentMethodItem) {
    setEditing(
      item ?? {
        id: createId("pm"),
        code: "",
        name: "",
        category: "Card",
        requiresReference: true,
        enabled: true,
      },
    );
    setError("");
  }

  function submit() {
    if (!editing) return;
    if (editing.code.trim().length < 2 || editing.name.trim().length < 2) {
      setError("Enter both a tender code and payment method name.");
      return;
    }
    savePaymentMethod({
      ...editing,
      code: editing.code.trim().toUpperCase(),
      name: editing.name.trim(),
    });
    setEditing(null);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <BackBreadcrumb current="Payment Methods" />
      <PageHeader
        eyebrow="Master Configuration"
        title="Payment Methods"
        description="Configure accepted CAD point-of-sale tenders and drug plan billing methods."
        status={<Badge tone="neutral">Currency: CAD · Demo Data</Badge>}
        actions={
          <Button type="button" onClick={() => openEditor()}>
            <Plus className="h-4 w-4" />
            Add Payment Method
          </Button>
        }
      />

      <Section title="Accepted Tenders & Plan Billing">
        <DataTable
          rows={state.masterConfig.paymentMethods}
          searchPlaceholder="Search tender code, name, or category..."
          getSearchText={(row) => `${row.code} ${row.name} ${row.category}`}
          columns={[
            { key: "code", header: "Code", cell: (row) => <span className="font-mono font-semibold">{row.code}</span> },
            { key: "name", header: "Payment Method", cell: (row) => <span className="font-semibold">{row.name}</span> },
            { key: "category", header: "Category", cell: (row) => <Badge tone="neutral">{row.category}</Badge> },
            {
              key: "ref",
              header: "Reference / Auth #",
              cell: (row) => (row.requiresReference ? "Required" : "Optional"),
            },
            {
              key: "enabled",
              header: "Enabled",
              cell: (row) => (
                <Switch
                  checked={row.enabled}
                  aria-label={`Toggle ${row.name}`}
                  onCheckedChange={(enabled) => savePaymentMethod({ ...row, enabled })}
                />
              ),
            },
            {
              key: "actions",
              header: "Actions",
              cell: (row) => (
                <div className="flex gap-1.5">
                  <Button type="button" size="sm" variant="secondary" onClick={() => openEditor(row)}>
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setPendingDelete(row)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Section>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} title="Payment Method">
        {editing ? (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tender Code" required>
                <Input
                  value={editing.code}
                  placeholder="e.g., DEBIT"
                  onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                />
              </Field>
              <Field label="Category" required>
                <Select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      category: e.target.value as PaymentMethodItem["category"],
                    })
                  }
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Account">Account</option>
                </Select>
              </Field>
            </div>
            <Field label="Method Name" required>
              <Input
                value={editing.name}
                placeholder="e.g., Interac Debit"
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </Field>
            <label className="flex items-center justify-between text-sm">
              Require transaction / claim reference number
              <Switch
                checked={editing.requiresReference}
                onCheckedChange={(requiresReference) => setEditing({ ...editing, requiresReference })}
              />
            </label>
            {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={submit}>
                Save Method
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove payment method?"
        description={pendingDelete ? `Remove "${pendingDelete.name}" from accepted tenders?` : undefined}
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (pendingDelete) deletePaymentMethod(pendingDelete.id);
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

function TaxConfigurationView() {
  const { state, saveTaxRule, deleteTaxRule } = useCpos();
  const [editing, setEditing] = useState<TaxRuleItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TaxRuleItem | null>(null);
  const [error, setError] = useState("");

  function openEditor(item?: TaxRuleItem) {
    setEditing(
      item ?? {
        id: createId("tax"),
        name: "",
        province: state.contact.province,
        taxType: "HST",
        rate: 13,
        appliesToRx: false,
        appliesToOtc: true,
        effectiveDate: new Date().toISOString().slice(0, 10),
        active: true,
      },
    );
    setError("");
  }

  function submit() {
    if (!editing) return;
    if (editing.name.trim().length < 2 || editing.rate < 0 || editing.rate > 25) {
      setError("Enter a valid tax rule name and percentage rate (0% – 25%).");
      return;
    }
    saveTaxRule({ ...editing, name: editing.name.trim() });
    setEditing(null);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <BackBreadcrumb current="Tax Configuration" />
      <PageHeader
        eyebrow="Master Configuration"
        title="Tax Configuration"
        description="Maintain provincial GST, HST, PST, and QST tax schedules for OTC front-store items and zero-rated prescription medications."
        status={<Badge tone="neutral">Demonstration Data</Badge>}
        actions={
          <Button type="button" onClick={() => openEditor()}>
            <Plus className="h-4 w-4" />
            Add Tax Rule
          </Button>
        }
      />

      <Section title="Provincial Tax Rules">
        <DataTable
          rows={state.masterConfig.taxRules}
          searchPlaceholder="Search tax rule, province, or type..."
          getSearchText={(row) => `${row.name} ${row.province} ${row.taxType}`}
          columns={[
            { key: "name", header: "Rule Name", cell: (row) => <span className="font-semibold">{row.name}</span> },
            { key: "province", header: "Province", cell: (row) => `${provinceName(row.province)} (${row.province})` },
            { key: "type", header: "Tax Type", cell: (row) => <Badge tone="brand">{row.taxType}</Badge> },
            { key: "rate", header: "Rate", cell: (row) => <span className="font-mono font-semibold">{row.rate}%</span> },
            {
              key: "scope",
              header: "Applicability",
              cell: (row) => (
                <div className="flex flex-wrap gap-1">
                  <Badge tone={row.appliesToRx ? "warning" : "success"}>
                    Rx: {row.appliesToRx ? "Taxable" : "Zero-rated"}
                  </Badge>
                  <Badge tone={row.appliesToOtc ? "neutral" : "neutral"}>
                    OTC: {row.appliesToOtc ? "Taxable" : "Exempt"}
                  </Badge>
                </div>
              ),
            },
            {
              key: "active",
              header: "Active",
              cell: (row) => (
                <Switch
                  checked={row.active}
                  aria-label={`Toggle ${row.name}`}
                  onCheckedChange={(active) => saveTaxRule({ ...row, active })}
                />
              ),
            },
            {
              key: "actions",
              header: "Actions",
              cell: (row) => (
                <div className="flex gap-1.5">
                  <Button type="button" size="sm" variant="secondary" onClick={() => openEditor(row)}>
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setPendingDelete(row)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Section>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} title="Tax Rule">
        {editing ? (
          <div className="grid gap-4">
            <Field label="Rule Name" required>
              <Input
                value={editing.name}
                placeholder="e.g., Ontario HST"
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Province" required>
                <Select
                  value={editing.province}
                  onChange={(e) => setEditing({ ...editing, province: e.target.value as Province })}
                >
                  {PROVINCES.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tax Type" required>
                <Select
                  value={editing.taxType}
                  onChange={(e) =>
                    setEditing({ ...editing, taxType: e.target.value as TaxRuleItem["taxType"] })
                  }
                >
                  <option value="HST">HST</option>
                  <option value="GST">GST</option>
                  <option value="PST">PST</option>
                  <option value="QST">QST</option>
                </Select>
              </Field>
              <Field label="Rate (%)" required>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={25}
                  value={editing.rate}
                  onChange={(e) => setEditing({ ...editing, rate: Number(e.target.value) || 0 })}
                />
              </Field>
            </div>
            <Field label="Effective Date" required>
              <Input
                type="date"
                value={editing.effectiveDate}
                onChange={(e) => setEditing({ ...editing, effectiveDate: e.target.value })}
              />
            </Field>
            <label className="flex items-center justify-between text-sm">
              Applies to OTC / Front-store products
              <Switch
                checked={editing.appliesToOtc}
                onCheckedChange={(appliesToOtc) => setEditing({ ...editing, appliesToOtc })}
              />
            </label>
            <label className="flex items-center justify-between text-sm">
              Applies to Prescription medications
              <Switch
                checked={editing.appliesToRx}
                onCheckedChange={(appliesToRx) => setEditing({ ...editing, appliesToRx })}
              />
            </label>
            {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={submit}>
                Save Tax Rule
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete tax rule?"
        description={pendingDelete ? `Remove "${pendingDelete.name}" (${pendingDelete.rate}%)?` : undefined}
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (pendingDelete) deleteTaxRule(pendingDelete.id);
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

const referenceTabs: { id: ReferenceDataCategory; label: string }[] = [
  { id: "dosage-forms", label: "Dosage Forms" },
  { id: "routes", label: "Administration Routes" },
  { id: "sig-codes", label: "Sig / Frequency Codes" },
  { id: "hold-reasons", label: "Hold & Refusal Reasons" },
];

function ReferenceDataView() {
  const { state, saveReferenceItem, deleteReferenceItem } = useCpos();
  const [activeTab, setActiveTab] = useState<ReferenceDataCategory>("dosage-forms");
  const [editing, setEditing] = useState<ReferenceDataItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ReferenceDataItem | null>(null);
  const [error, setError] = useState("");

  const rows = useMemo(
    () => state.masterConfig.referenceData.filter((item) => item.category === activeTab),
    [activeTab, state.masterConfig.referenceData],
  );

  function openEditor(item?: ReferenceDataItem) {
    setEditing(
      item ?? {
        id: createId("ref"),
        category: activeTab,
        code: "",
        label: "",
        description: "",
        active: true,
      },
    );
    setError("");
  }

  function submit() {
    if (!editing) return;
    if (editing.code.trim().length < 1 || editing.label.trim().length < 2) {
      setError("Enter both a reference code and display label.");
      return;
    }
    saveReferenceItem({
      ...editing,
      code: editing.code.trim().toUpperCase(),
      label: editing.label.trim(),
    });
    setEditing(null);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <BackBreadcrumb current="Common Reference Data" />
      <PageHeader
        eyebrow="Master Configuration"
        title="Common Reference Data"
        description="Standardized clinical and dispensary lookup codes used across prescription entry and labelling."
        status={<Badge tone="neutral">Demonstration Data</Badge>}
        actions={
          <Button type="button" onClick={() => openEditor()}>
            <Plus className="h-4 w-4" />
            Add Reference Code
          </Button>
        }
      />

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#DCE3EA] pb-3" role="tablist">
        {referenceTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? "bg-[#0F2137] text-white"
                : "border border-[#DCE3EA] bg-white text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Section title={referenceTabs.find((t) => t.id === activeTab)?.label ?? "Reference Codes"}>
        <DataTable
          rows={rows}
          searchPlaceholder="Search code, label, or description..."
          getSearchText={(row) => `${row.code} ${row.label} ${row.description}`}
          columns={[
            { key: "code", header: "Code", cell: (row) => <span className="font-mono font-semibold">{row.code}</span> },
            { key: "label", header: "Label", cell: (row) => <span className="font-semibold">{row.label}</span> },
            { key: "desc", header: "Description", cell: (row) => <span className="text-muted">{row.description}</span> },
            {
              key: "active",
              header: "Active",
              cell: (row) => (
                <Switch
                  checked={row.active}
                  aria-label={`Toggle ${row.code}`}
                  onCheckedChange={(active) => saveReferenceItem({ ...row, active })}
                />
              ),
            },
            {
              key: "actions",
              header: "Actions",
              cell: (row) => (
                <div className="flex gap-1.5">
                  <Button type="button" size="sm" variant="secondary" onClick={() => openEditor(row)}>
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setPendingDelete(row)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Section>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} title="Reference Data Item">
        {editing ? (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Code" required>
                <Input
                  value={editing.code}
                  placeholder="e.g., TAB"
                  onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                />
              </Field>
              <Field label="Display Label" required>
                <Input
                  value={editing.label}
                  placeholder="e.g., Tablet"
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Description">
              <Input
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </Field>
            {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={submit}>
                Save Code
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete reference item?"
        description={pendingDelete ? `Remove "${pendingDelete.code} — ${pendingDelete.label}"?` : undefined}
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (pendingDelete) deleteReferenceItem(pendingDelete.id);
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

export function MasterCategoryView({ category }: { category: string }) {
  switch (category) {
    case "locations":
      return (
        <div className="mx-auto max-w-6xl">
          <BackBreadcrumb current="Pharmacy Locations" />
          <LocationOverview />
        </div>
      );
    case "departments":
      return <DepartmentsView />;
    case "prescription-statuses":
      return <PrescriptionStatusesView />;
    case "payment-methods":
      return <PaymentMethodsView />;
    case "tax":
      return <TaxConfigurationView />;
    case "notifications":
      return (
        <div className="mx-auto max-w-5xl">
          <BackBreadcrumb current="Notification Preferences" />
          <NotificationConfiguration />
        </div>
      );
    case "reference-data":
      return <ReferenceDataView />;
    default:
      return (
        <div className="mx-auto max-w-3xl space-y-4">
          <BackBreadcrumb current="Unknown Category" />
          <Section title="Category not found">
            <p className="text-sm text-muted">
              Select a Master Configuration category from the hub.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/configuration/master">Return to Master Configuration</Link>
            </Button>
          </Section>
        </div>
      );
  }
}

