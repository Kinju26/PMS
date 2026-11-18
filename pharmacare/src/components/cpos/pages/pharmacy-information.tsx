"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Upload } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, PageHeader, Section, Select } from "@/components/cpos/fields";
import { StatusBadge } from "@/components/cpos/status-badge";
import { UnsavedChangesBar } from "@/components/cpos/unsaved-bar";
import { PHARMACY_TYPES, PROVINCES, provinceName, TIME_ZONES } from "@/lib/cpos/constants";
import { pharmacyProfileFullSchema } from "@/lib/cpos/schemas";
import { useCpos } from "@/lib/cpos/store";
import type { z } from "zod";

type PharmacyProfileForm = z.infer<typeof pharmacyProfileFullSchema>;

export function PharmacyInformation() {
  const { state, saveFullPharmacyProfile } = useCpos();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const defaultValues: PharmacyProfileForm = {
    legalName: state.pharmacy.legalName,
    operatingName: state.pharmacy.operatingName,
    logoName: state.pharmacy.logoName,
    pharmacyType: state.pharmacy.pharmacyType,
    regulatoryId: state.pharmacy.regulatoryId,
    pharmacistInCharge: state.pharmacy.pharmacistInCharge,
    status: state.pharmacy.status,
    street: state.contact.street,
    suite: state.contact.suite,
    city: state.contact.city,
    province: state.contact.province,
    postalCode: state.contact.postalCode,
    country: state.contact.country,
    phone: state.contact.phone,
    fax: state.contact.fax,
    email: state.contact.email,
    timeZone: state.regional.timeZone,
  };

  const form = useForm<PharmacyProfileForm>({
    resolver: zodResolver(pharmacyProfileFullSchema),
    defaultValues,
  });

  const watched = useWatch({ control: form.control });
  const isDirty = isEditing && form.formState.isDirty;

  function onSubmit(values: PharmacyProfileForm) {
    saveFullPharmacyProfile(
      {
        legalName: values.legalName,
        operatingName: values.operatingName,
        logoName: values.logoName,
        pharmacyType: values.pharmacyType,
        regulatoryId: values.regulatoryId,
        pharmacistInCharge: values.pharmacistInCharge,
        province: values.province,
        status: values.status,
      },
      {
        street: values.street,
        suite: values.suite,
        city: values.city,
        province: values.province,
        postalCode: values.postalCode.toUpperCase(),
        country: values.country,
        phone: values.phone,
        fax: values.fax,
        email: values.email,
      },
      values.timeZone,
    );
    form.reset(values);
    setIsEditing(false);
  }

  function handleCancelClick() {
    if (isDirty) {
      setConfirmCancel(true);
      return;
    }
    form.reset(defaultValues);
    setIsEditing(false);
  }

  function confirmDiscard() {
    form.reset(defaultValues);
    setIsEditing(false);
    setConfirmCancel(false);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        eyebrow="Phase 0 · Pharmacy Configuration"
        title="Pharmacy Details"
        description="Maintain legal entity identity, operating name, physical street address, contact details, logo file, and active pharmacy status."
        status={
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={watched.status ?? state.pharmacy.status} />
            <Badge tone="neutral">Demonstration Data</Badge>
          </div>
        }
        actions={
          isEditing ? (
            <>
              <Button type="button" variant="secondary" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => {
                form.reset(defaultValues);
                setIsEditing(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Details
            </Button>
          )
        }
      />

      <UnsavedChangesBar
        dirty={isDirty}
        onDiscard={confirmDiscard}
        saveType="submit"
        saveLabel="Save Changes"
      />

      {!isEditing ? (
        <div className="space-y-5">
          <Section
            title="Identity & Operational Status"
            description="Displayed on prescription labels, official patient receipts, and provincial reports."
          >
            <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs font-medium text-muted">Legal Pharmacy Name</dt>
                <dd className="mt-1 font-semibold text-ink">{state.pharmacy.legalName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Operating Name</dt>
                <dd className="mt-1 font-semibold text-ink">{state.pharmacy.operatingName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Pharmacy Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={state.pharmacy.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Pharmacy Type</dt>
                <dd className="mt-1 text-ink">{state.pharmacy.pharmacyType}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Time Zone</dt>
                <dd className="mt-1 font-mono text-xs text-ink">{state.regional.timeZone}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Pharmacy Logo</dt>
                <dd className="mt-1 font-mono text-xs text-ink">
                  {state.pharmacy.logoName || "None uploaded"}
                </dd>
              </div>
            </dl>
          </Section>

          <Section
            title="Address & Direct Contact"
            description="Primary physical address and communications lines for patients and prescribers."
          >
            <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-muted">Street Address</dt>
                <dd className="mt-1 font-semibold text-ink">
                  {state.contact.street}
                  {state.contact.suite ? `, ${state.contact.suite}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">City &amp; Province</dt>
                <dd className="mt-1 text-ink">
                  {state.contact.city}, {provinceName(state.contact.province)} ({state.contact.province})
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Postal Code</dt>
                <dd className="mt-1 font-mono text-ink">{state.contact.postalCode}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Phone</dt>
                <dd className="mt-1 text-ink">{state.contact.phone}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Fax</dt>
                <dd className="mt-1 text-ink">{state.contact.fax || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-muted">Email</dt>
                <dd className="mt-1 text-ink">{state.contact.email}</dd>
              </div>
            </dl>
          </Section>
        </div>
      ) : (
        <div className="space-y-5">
          <Section
            title="Pharmacy Identity & Status"
            description="Fields marked with * are required to complete Phase 0 setup."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Legal Pharmacy Name"
                htmlFor="legalName"
                required
                error={form.formState.errors.legalName?.message}
              >
                <Input id="legalName" {...form.register("legalName")} />
              </Field>
              <Field
                label="Operating Name"
                htmlFor="operatingName"
                required
                error={form.formState.errors.operatingName?.message}
              >
                <Input id="operatingName" {...form.register("operatingName")} />
              </Field>
              <Field
                label="Pharmacy Status"
                htmlFor="status"
                required
              >
                <Select id="status" {...form.register("status")}>
                  <option value="active">Active</option>
                  <option value="pending">Pending Setup</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>
              <Field label="Pharmacy Type" htmlFor="pharmacyType" required>
                <Select id="pharmacyType" {...form.register("pharmacyType")}>
                  {PHARMACY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Pharmacy Logo"
                htmlFor="logo"
                hint={watched.logoName ? `Current file: ${watched.logoName}` : "Upload SVG or PNG logo"}
              >
                <div className="flex items-center gap-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) form.setValue("logoName", file.name, { shouldDirty: true });
                    }}
                  />
                  <Upload className="h-4 w-4 shrink-0 text-muted" />
                </div>
              </Field>
              <Field label="Time Zone" htmlFor="timeZone" required>
                <Select id="timeZone" {...form.register("timeZone")}>
                  {TIME_ZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Section>

          <Section
            title="Address & Contact Information"
            description="Physical street address, Canadian postal code, and direct dispensary contact lines."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Street Address"
                htmlFor="street"
                required
                error={form.formState.errors.street?.message}
              >
                <Input id="street" {...form.register("street")} />
              </Field>
              <Field label="Suite / Unit" htmlFor="suite">
                <Input id="suite" {...form.register("suite")} />
              </Field>
              <Field
                label="City"
                htmlFor="city"
                required
                error={form.formState.errors.city?.message}
              >
                <Input id="city" {...form.register("city")} />
              </Field>
              <Field
                label="Province"
                htmlFor="province"
                required
                error={form.formState.errors.province?.message}
              >
                <Select id="province" {...form.register("province")}>
                  {PROVINCES.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name} ({province.code})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Postal Code"
                htmlFor="postalCode"
                required
                hint="Format: A1A 1A1"
                error={form.formState.errors.postalCode?.message}
              >
                <Input id="postalCode" {...form.register("postalCode")} />
              </Field>
              <Field
                label="Phone"
                htmlFor="phone"
                required
                error={form.formState.errors.phone?.message}
              >
                <Input id="phone" {...form.register("phone")} />
              </Field>
              <Field label="Fax" htmlFor="fax">
                <Input id="fax" {...form.register("fax")} />
              </Field>
              <Field
                label="Email"
                htmlFor="email"
                required
                error={form.formState.errors.email?.message}
              >
                <Input id="email" type="email" {...form.register("email")} />
              </Field>
            </div>
          </Section>
        </div>
      )}

      <Dialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Discard unsaved changes?"
        description="You have modified fields in Pharmacy Details. Discarding will revert to the last saved values."
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setConfirmCancel(false)}>
            Continue Editing
          </Button>
          <Button type="button" variant="danger" onClick={confirmDiscard}>
            Discard Changes
          </Button>
        </div>
      </Dialog>
    </form>
  );
}
