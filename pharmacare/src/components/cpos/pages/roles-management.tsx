"use client";

import Link from "next/link";
import { KeyRound, Plus, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, PageHeader, Section, Select } from "@/components/cpos/fields";
import { PERMISSION_CATALOG } from "@/lib/cpos/constants";
import { useCpos } from "@/lib/cpos/store";
import { createId } from "@/lib/utils";
import type { PermissionKey, RoleDefinition } from "@/types/cpos";

const scopeTone: Record<RoleDefinition["scope"], "brand" | "success" | "warning" | "neutral"> = {
  Clinical: "brand",
  Operations: "success",
  Administration: "warning",
  Compliance: "neutral",
};

export function RolesManagement() {
  const { state, saveRole } = useCpos();
  const [editing, setEditing] = useState<RoleDefinition | null>(null);
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [scopeInput, setScopeInput] = useState<RoleDefinition["scope"]>("Operations");
  const [permsInput, setPermsInput] = useState<PermissionKey[]>([]);
  const [formError, setFormError] = useState("");

  function openEditor(role?: RoleDefinition) {
    if (role) {
      setEditing(role);
      setNameInput(role.name);
      setDescInput(role.description);
      setScopeInput(role.scope);
      setPermsInput([...role.permissions]);
    } else {
      const fresh: RoleDefinition = {
        id: createId("role"),
        name: "",
        description: "",
        scope: "Operations",
        isSystem: false,
        permissions: ["patient_access"],
      };
      setEditing(fresh);
      setNameInput("");
      setDescInput("");
      setScopeInput("Operations");
      setPermsInput(["patient_access"]);
    }
    setFormError("");
  }

  function submitRole() {
    if (!editing) return;
    if (nameInput.trim().length < 2) {
      setFormError("Enter a role name (at least 2 characters).");
      return;
    }
    if (descInput.trim().length < 8) {
      setFormError("Provide a short description of this role's pharmacy responsibilities.");
      return;
    }
    if (permsInput.length === 0) {
      setFormError("Select at least one permission for this role.");
      return;
    }
    saveRole({
      ...editing,
      name: nameInput.trim(),
      description: descInput.trim(),
      scope: scopeInput,
      permissions: permsInput,
    });
    setEditing(null);
  }

  const visibleRoles = state.roles.filter(
    (role) => scopeFilter === "all" || role.scope === scopeFilter,
  );
  const highRiskKeys = new Set(
    PERMISSION_CATALOG.filter((item) => item.highRisk).map((item) => item.key),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        eyebrow="Phase 0 · User & Access Management"
        title="Roles Management"
        description="Review the 10 standard Canadian pharmacy operating roles, assigned staff counts, and high-risk clinical or billing authority."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="secondary">
              <Link href="/access/permissions">
                <KeyRound className="h-4 w-4" />
                Permission Matrix
              </Link>
            </Button>
            <Button type="button" onClick={() => openEditor()}>
              <Plus className="h-4 w-4" />
              Add custom role
            </Button>
          </div>
        }
      />

      {/* Summary metrics */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <div>
            <p className="text-xs font-medium text-muted">Configured Roles</p>
            <p className="mt-1 text-2xl font-bold text-ink tabular-nums">{state.roles.length}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E7F6F1] text-[#1D9E75]">
            <ShieldCheck className="h-5 w-5" />
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <div>
            <p className="text-xs font-medium text-muted">Roles with High-Risk Access</p>
            <p className="mt-1 text-2xl font-bold text-ink tabular-nums">
              {state.roles.filter((r) => r.permissions.some((p) => highRiskKeys.has(p))).length}
            </p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600">
            <ShieldAlert className="h-5 w-5" />
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <div>
            <p className="text-xs font-medium text-muted">Assigned Active Staff</p>
            <p className="mt-1 text-2xl font-bold text-ink tabular-nums">
              {state.users.filter((u) => u.status === "active").length}
            </p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-light text-[#087f8c]">
            <Users className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Scope Filter Chips */}
      <Section
        title="Pharmacy Role Directory"
        description="Standard CPOS roles enforce separation of clinical verification, dispensing, billing, inventory, and audit duties."
        action={
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter roles by scope">
            {["all", "Clinical", "Operations", "Administration", "Compliance"].map((scope) => (
              <button
                key={scope}
                type="button"
                onClick={() => setScopeFilter(scope)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  scopeFilter === scope
                    ? "bg-[#10233a] text-white"
                    : "bg-[#F4F8FB] text-muted hover:bg-[#E6EEF2] hover:text-ink"
                }`}
              >
                {scope === "all" ? "All Scopes" : scope}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          {visibleRoles.map((role) => {
            const assignedUsers = state.users.filter((u) => u.role === role.name);
            const highRiskCount = role.permissions.filter((p) => highRiskKeys.has(p)).length;
            return (
              <article
                key={role.id}
                className="flex flex-col justify-between rounded-xl border border-[#E6EEF2] bg-[#FCFDFE] p-4 transition hover:border-[#1D9E75]/40 hover:shadow-xs"
              >
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">{role.name}</h3>
                      <Badge tone={scopeTone[role.scope]} className="rounded-full text-[11px]">
                        {role.scope}
                      </Badge>
                    </div>
                    {highRiskCount > 0 ? (
                      <Badge tone="danger" className="gap-1 rounded-full text-[10px]">
                        <ShieldAlert className="h-3 w-3" />
                        {highRiskCount} high-risk
                      </Badge>
                    ) : (
                      <Badge tone="neutral" className="rounded-full text-[10px]">
                        Standard risk
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{role.description}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#EEF3F6] pt-3 text-xs">
                  <div className="flex items-center gap-3 text-muted">
                    <span>
                      <strong className="text-ink">{role.permissions.length}</strong> /{" "}
                      {PERMISSION_CATALOG.length} permissions
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="text-ink">{assignedUsers.length}</strong>{" "}
                      {assignedUsers.length === 1 ? "user" : "users"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" size="sm" variant="secondary" onClick={() => openEditor(role)}>
                      Edit
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/access/permissions?role=${encodeURIComponent(role.id)}`}>
                        Matrix
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      {/* Create / Edit Role Modal */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing && state.roles.some((r) => r.id === editing.id) ? `Edit ${editing.name}` : "Create Custom Role"}
        description="Frontend governance editor. Backend RBAC enforcement is wired separately."
        className="w-[min(640px,calc(100%-2rem))]"
      >
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role Name">
              <Input
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="e.g., Clinical Lead Pharmacist"
                disabled={Boolean(editing?.isSystem)}
              />
            </Field>
            <Field label="Operational Scope">
              <Select
                value={scopeInput}
                onChange={(event) => setScopeInput(event.target.value as RoleDefinition["scope"])}
              >
                <option value="Clinical">Clinical</option>
                <option value="Operations">Operations</option>
                <option value="Administration">Administration</option>
                <option value="Compliance">Compliance</option>
              </Select>
            </Field>
          </div>

          <Field label="Role Description">
            <Textarea
              rows={2}
              value={descInput}
              onChange={(event) => setDescInput(event.target.value)}
              placeholder="Summarize clinical, operational, or compliance responsibilities."
            />
          </Field>

          <fieldset className="rounded-xl border border-line p-3.5">
            <legend className="px-1 text-xs font-semibold text-ink uppercase">
              Assigned Permissions ({permsInput.length} / {PERMISSION_CATALOG.length})
            </legend>
            <div className="mt-2 grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {PERMISSION_CATALOG.map((perm) => {
                const checked = permsInput.includes(perm.key);
                return (
                  <label
                    key={perm.key}
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-xs ${
                      perm.highRisk ? "border-red-100 bg-red-50/40" : "border-transparent bg-[#F8FBFD]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox mt-0.5 h-3.5 w-3.5 rounded border-line text-brand"
                      checked={checked}
                      onChange={() =>
                        setPermsInput((current) =>
                          checked ? current.filter((k) => k !== perm.key) : [...current, perm.key],
                        )
                      }
                    />
                    <span>
                      <span className="block font-medium text-ink">{perm.label}</span>
                      {perm.highRisk ? (
                        <span className="text-[10px] font-semibold text-red-700">High Risk</span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {formError ? <p className="text-xs font-medium text-red-700">{formError}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={submitRole}>
              Save role
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

