"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, Plus, ShieldAlert, UserCheck, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/cpos/data-table";
import { Field, PageHeader, Section, Select } from "@/components/cpos/fields";
import { StatusBadge } from "@/components/cpos/status-badge";
import { initials } from "@/lib/auth";
import { PERMISSION_CATALOG, USER_ROLES } from "@/lib/cpos/constants";
import { userSchema } from "@/lib/cpos/schemas";
import { useCpos } from "@/lib/cpos/store";
import { createId } from "@/lib/utils";
import type { LocationUser } from "@/types/cpos";
import type { z } from "zod";

type UserDraft = z.infer<typeof userSchema>;

export function LocationUsers() {
  const { state, saveUser, setUserStatus } = useCpos();
  const [editorOpen, setEditorOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<LocationUser | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const defaultLocationId = state.locations[0]?.id ?? "loc-harbour";

  const blank = (): UserDraft => ({
    id: "usr-new",
    name: "",
    email: "",
    phone: "",
    licenceNumber: "",
    role: "Pharmacist",
    locationId: defaultLocationId,
    permissions:
      state.roles.find((r) => r.name === "Pharmacist")?.permissions ?? ["patient_access"],
    status: "active",
  });

  const form = useForm<UserDraft>({
    resolver: zodResolver(userSchema),
    defaultValues: blank(),
  });

  const selectedPermissions = useWatch({ control: form.control, name: "permissions" }) ?? [];
  const selectedRoleName = useWatch({ control: form.control, name: "role" });

  function openEditor(user?: LocationUser) {
    if (user) {
      form.reset({
        ...user,
        phone: user.phone ?? "",
        licenceNumber: user.licenceNumber ?? "",
      });
    } else {
      form.reset({ ...blank(), id: createId("usr"), locationId: defaultLocationId });
    }
    setEditorOpen(true);
  }

  function applyRoleDefaults(roleName: string) {
    const match = state.roles.find((role) => role.name === roleName);
    if (match) {
      form.setValue("permissions", [...match.permissions], { shouldValidate: true });
    }
  }

  const filteredUsers = useMemo(() => {
    return state.users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesRole && matchesStatus;
    });
  }, [roleFilter, state.users, statusFilter]);

  const activeCount = state.users.filter((u) => u.status === "active").length;
  const inactiveCount = state.users.length - activeCount;
  const clinicalCount = state.users.filter((u) =>
    ["Pharmacy Manager", "Pharmacist", "Pharmacy Technician"].includes(u.role),
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        eyebrow="Phase 0 · User & Access Management"
        title="User Management"
        description="Manage Canadian pharmacy staff accounts, role assignments, licence references, and active status. Authentication and permanent provisioning will connect to the backend identity service."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="secondary">
              <Link href="/access/permissions">Role Matrix</Link>
            </Button>
            <Button type="button" onClick={() => openEditor()}>
              <UserPlus className="h-4 w-4" />
              Add user
            </Button>
          </div>
        }
      />

      {/* Summary metrics */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <div>
            <p className="text-xs font-medium text-muted">Total Staff Accounts</p>
            <p className="mt-1 text-2xl font-bold text-ink tabular-nums">{state.users.length}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-light text-[#087f8c]">
            <Users className="h-5 w-5" />
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <div>
            <p className="text-xs font-medium text-muted">Active / Inactive</p>
            <p className="mt-1 text-2xl font-bold text-ink tabular-nums">
              {activeCount}{" "}
              <span className="text-sm font-medium text-muted">/ {inactiveCount} inactive</span>
            </p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E7F6F1] text-[#1D9E75]">
            <UserCheck className="h-5 w-5" />
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <div>
            <p className="text-xs font-medium text-muted">Regulated Clinical Staff</p>
            <p className="mt-1 text-2xl font-bold text-ink tabular-nums">{clinicalCount}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <ShieldAlert className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Staff Table */}
      <Section
        title="Pharmacy Staff Directory"
        description="Filter by Canadian pharmacy role or account status. Click View to inspect assigned permissions and high-risk access."
      >
        <DataTable
          rows={filteredUsers}
          searchPlaceholder="Search by name, email, role, or licence..."
          getSearchText={(row) => `${row.name} ${row.email} ${row.role} ${row.licenceNumber ?? ""}`}
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                aria-label="Filter by role"
                className="h-10 w-full sm:w-48"
              >
                <option value="all">All roles ({USER_ROLES.length})</option>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
              <Select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | "active" | "inactive")
                }
                aria-label="Filter by status"
                className="h-10 w-full sm:w-36"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          }
          columns={[
            {
              key: "name",
              header: "User",
              cell: (row) => (
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#E7F6F1] text-xs font-bold text-[#178666]">
                    {initials(row.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{row.name}</p>
                    <p className="truncate text-xs text-muted">{row.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "role",
              header: "Role",
              cell: (row) => (
                <div>
                  <Badge tone="brand" className="rounded-full">
                    {row.role}
                  </Badge>
                  {row.licenceNumber ? (
                    <p className="mt-1 font-mono text-[11px] text-muted">{row.licenceNumber}</p>
                  ) : null}
                </div>
              ),
            },
            {
              key: "location",
              header: "Location",
              cell: (row) =>
                state.locations.find((location) => location.id === row.locationId)?.operatingName ??
                state.pharmacy.operatingName,
            },
            {
              key: "permissions",
              header: "Permissions",
              cell: (row) => {
                const highRiskCount = row.permissions.filter((p) =>
                  PERMISSION_CATALOG.some((cat) => cat.key === p && cat.highRisk),
                ).length;
                return (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-ink">
                      {row.permissions.length} assigned
                    </span>
                    {highRiskCount > 0 ? (
                      <Badge tone="danger" className="rounded-full text-[10px]">
                        {highRiskCount} high-risk
                      </Badge>
                    ) : null}
                  </div>
                );
              },
            },
            { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
            {
              key: "actions",
              header: "Actions",
              cell: (row) => (
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setViewingUser(row)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Profile
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => openEditor(row)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setUserStatus(row.id, row.status === "active" ? "inactive" : "active")
                    }
                  >
                    {row.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Section>

      {/* View User Profile Dialog */}
      <Dialog
        open={viewingUser !== null}
        onOpenChange={(open) => !open && setViewingUser(null)}
        title={viewingUser ? viewingUser.name : "User Profile"}
        description="Staff profile and effective Phase 0 role permissions."
        className="w-[min(640px,calc(100%-2rem))]"
      >
        {viewingUser ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#EEF3F6] bg-[#F8FBFD] p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1D9E75] text-sm font-bold text-white">
                  {initials(viewingUser.name)}
                </span>
                <div>
                  <p className="text-base font-semibold text-ink">{viewingUser.name}</p>
                  <p className="text-xs text-muted">{viewingUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="brand" className="rounded-full">
                  {viewingUser.role}
                </Badge>
                <StatusBadge status={viewingUser.status} />
              </div>
            </div>

            <div className="grid gap-3 text-xs sm:grid-cols-3">
              <div className="rounded-xl border border-line p-3">
                <p className="text-muted">Assigned Location</p>
                <p className="mt-1 font-semibold text-ink">
                  {state.locations.find((l) => l.id === viewingUser.locationId)?.operatingName ??
                    state.pharmacy.operatingName}
                </p>
              </div>
              <div className="rounded-xl border border-line p-3">
                <p className="text-muted">College / Licence #</p>
                <p className="mt-1 font-mono font-semibold text-ink">
                  {viewingUser.licenceNumber || "Not applicable"}
                </p>
              </div>
              <div className="rounded-xl border border-line p-3">
                <p className="text-muted">Direct Phone</p>
                <p className="mt-1 font-semibold text-ink">{viewingUser.phone || "On pharmacy line"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                Assigned Permissions ({viewingUser.permissions.length})
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {viewingUser.permissions.map((permKey) => {
                  const def = PERMISSION_CATALOG.find((p) => p.key === permKey);
                  return (
                    <Badge
                      key={permKey}
                      tone={def?.highRisk ? "danger" : "neutral"}
                      className="rounded-full"
                    >
                      {def ? def.label : permKey}
                      {def?.highRisk ? " · High Risk" : ""}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-line pt-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const target = viewingUser;
                  setViewingUser(null);
                  openEditor(target);
                }}
              >
                Edit profile
              </Button>
              <Button type="button" onClick={() => setViewingUser(null)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>

      {/* Add / Edit User Dialog */}
      <Dialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        title="Staff Account & Role Assignment"
        description="Assign one of the 10 standard CPOS pharmacy roles. Permissions prefill from the role matrix and can be reviewed below."
        className="w-[min(640px,calc(100%-2rem))]"
      >
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit((values) => {
            saveUser(values);
            setEditorOpen(false);
          })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" error={form.formState.errors.name?.message}>
              <Input placeholder="e.g., Amrita Shah" {...form.register("name")} />
            </Field>
            <Field label="Work Email" error={form.formState.errors.email?.message}>
              <Input type="email" placeholder="name@pharmacy.ca" {...form.register("email")} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone (Optional)">
              <Input placeholder="(416) 555-0148" {...form.register("phone")} />
            </Field>
            <Field label="Provincial Licence # (Optional)" hint="For pharmacists and regulated technicians">
              <Input placeholder="e.g., OCP #612044" {...form.register("licenceNumber")} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Pharmacy Role" error={form.formState.errors.role?.message}>
              <Select
                {...form.register("role")}
                onChange={(event) => {
                  const nextRole = event.target.value;
                  form.setValue("role", nextRole, { shouldValidate: true });
                  applyRoleDefaults(nextRole);
                }}
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Location" error={form.formState.errors.locationId?.message}>
              <Select {...form.register("locationId")}>
                {state.locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.operatingName}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Account Status">
              <Select {...form.register("status")}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Field>
          </div>

          <fieldset className="rounded-xl border border-line p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <legend className="text-xs font-semibold tracking-wide text-ink uppercase">
                Effective Permissions ({selectedPermissions.length})
              </legend>
              <button
                type="button"
                onClick={() => applyRoleDefaults(selectedRoleName)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D9E75] hover:text-[#178666]"
              >
                <Plus className="h-3 w-3" />
                Apply {selectedRoleName} defaults
              </button>
            </div>
            <div className="mt-2.5 grid max-h-48 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {PERMISSION_CATALOG.map((permission) => {
                const selected = selectedPermissions.includes(permission.key);
                return (
                  <label
                    key={permission.key}
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-xs transition ${
                      permission.highRisk
                        ? "border-red-100 bg-red-50/40"
                        : "border-transparent bg-[#F8FBFD]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox mt-0.5 h-3.5 w-3.5 rounded border-line text-brand"
                      checked={selected}
                      onChange={() => {
                        form.setValue(
                          "permissions",
                          selected
                            ? selectedPermissions.filter((item) => item !== permission.key)
                            : [...selectedPermissions, permission.key],
                          { shouldValidate: true },
                        );
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink">{permission.label}</span>
                      {permission.highRisk ? (
                        <span className="text-[10px] font-semibold text-red-700">High-risk control</span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
            {form.formState.errors.permissions ? (
              <p className="mt-1.5 text-xs text-red-700">
                {form.formState.errors.permissions.message}
              </p>
            ) : null}
          </fieldset>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save user</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
