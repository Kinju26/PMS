"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, PageHeader, Section, Select } from "@/components/cpos/fields";
import { DAYS, PROVINCES, TIME_ZONES, weekdayHours } from "@/lib/cpos/constants";
import { locationSchema } from "@/lib/cpos/schemas";
import { useCpos } from "@/lib/cpos/store";
import { createId } from "@/lib/utils";
import type { DayHours, Holiday, PharmacyLocation, Province } from "@/types/cpos";
import type { z } from "zod";

type LocationDraft = z.infer<typeof locationSchema>;

const steps = ["Basic information", "Contact information", "Regional configuration", "Location settings", "Review and save"];

const stepFields: (keyof LocationDraft)[][] = [
  ["legalName", "operatingName", "code", "pharmacistInCharge"],
  ["street", "city", "province", "postalCode", "phone", "email"],
  ["timeZone"],
  ["manager", "status"],
  [],
];

function draftFromLocation(location?: PharmacyLocation): LocationDraft {
  return {
    id: location?.id ?? "loc-new",
    legalName: location?.legalName ?? "",
    operatingName: location?.operatingName ?? "",
    code: location?.code ?? "",
    logoName: location?.logoName ?? "",
    pharmacistInCharge: location?.pharmacistInCharge ?? "",
    street: location?.street ?? "",
    city: location?.city ?? "",
    province: location?.province ?? "ON",
    postalCode: location?.postalCode ?? "",
    phone: location?.phone ?? "",
    fax: location?.fax ?? "",
    email: location?.email ?? "",
    timeZone: location?.timeZone ?? "America/Toronto",
    deliveryEnabled: location?.deliveryEnabled ?? false,
    pickupEnabled: location?.pickupEnabled ?? true,
    notificationsEnabled: location?.notificationsEnabled ?? true,
    status: location?.status ?? "pending",
    manager: location?.manager ?? "",
  };
}

export function LocationWizard({ location }: { location?: PharmacyLocation }) {
  const router = useRouter();
  const { saveLocation } = useCpos();
  const [step, setStep] = useState(0);
  const [hours, setHours] = useState<DayHours[]>(location?.hours ?? weekdayHours());
  const [holidays, setHolidays] = useState<Holiday[]>(location?.holidays ?? []);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const form = useForm<LocationDraft>({
    resolver: zodResolver(locationSchema),
    defaultValues: draftFromLocation(location),
  });
  const values = form.watch();

  async function next() {
    const fields = stepFields[step];
    if (fields.length > 0) {
      const valid = await form.trigger(fields);
      if (!valid) return;
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  return (
    <form
      className="mx-auto max-w-5xl"
      onSubmit={form.handleSubmit((draft) => {
        const id = draft.id === "loc-new" ? createId("loc") : draft.id;
        saveLocation({
          ...draft,
          id,
          province: draft.province as Province,
          hours,
          holidays,
        });
        router.push(`/locations/${id}`);
      })}
    >
      <PageHeader
        eyebrow="Multi-Location Management"
        title={location ? `Edit ${location.operatingName}` : "Add location"}
        description="Complete each step. You can move back without losing what you have entered in this session."
      />
      <ol className="mb-5 grid gap-2 sm:grid-cols-5">
        {steps.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => setStep(index)}
              className={`w-full rounded-md border px-3 py-2 text-left text-xs ${
                index === step ? "border-brand bg-brand-soft text-ink" : "border-line bg-white text-muted"
              }`}
            >
              <span className="block font-medium text-ink">
                {index + 1}. {label}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <Section title={steps[step] ?? "Review"}>
        {step === 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Legal pharmacy name" error={form.formState.errors.legalName?.message}>
              <Input {...form.register("legalName")} />
            </Field>
            <Field label="Operating name" error={form.formState.errors.operatingName?.message}>
              <Input {...form.register("operatingName")} />
            </Field>
            <Field label="Location code" error={form.formState.errors.code?.message}>
              <Input {...form.register("code")} />
            </Field>
            <Field label="Pharmacist-in-charge" error={form.formState.errors.pharmacistInCharge?.message}>
              <Input {...form.register("pharmacistInCharge")} />
            </Field>
            <Field label="Pharmacy logo" hint={values.logoName || "No file selected"}>
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) form.setValue("logoName", file.name);
                }}
              />
            </Field>
          </div>
        ) : null}
        {step === 1 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Address" error={form.formState.errors.street?.message} className="md:col-span-2">
              <Input {...form.register("street")} />
            </Field>
            <Field label="City" error={form.formState.errors.city?.message}>
              <Input {...form.register("city")} />
            </Field>
            <Field label="Province" error={form.formState.errors.province?.message}>
              <Select {...form.register("province")}>
                {PROVINCES.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Postal code" error={form.formState.errors.postalCode?.message}>
              <Input {...form.register("postalCode")} />
            </Field>
            <Field label="Phone" error={form.formState.errors.phone?.message}>
              <Input {...form.register("phone")} />
            </Field>
            <Field label="Fax">
              <Input {...form.register("fax")} />
            </Field>
            <Field label="Email" error={form.formState.errors.email?.message}>
              <Input type="email" {...form.register("email")} />
            </Field>
          </div>
        ) : null}
        {step === 2 ? (
          <div className="space-y-4">
            <Field label="Time zone">
              <Select {...form.register("timeZone")}>
                {TIME_ZONES.map((zone) => (
                  <option key={zone}>{zone}</option>
                ))}
              </Select>
            </Field>
            <div className="divide-y divide-line">
              {hours.map((row) => (
                <div key={row.day} className="grid items-center gap-3 py-3 md:grid-cols-[140px_1fr_1fr_auto]">
                  <p className="text-sm font-medium">{DAYS.find((day) => day.key === row.day)?.label}</p>
                  <Input type="time" value={row.opens} onChange={(event) => setHours((current) => current.map((item) => (item.day === row.day ? { ...item, opens: event.target.value } : item)))} />
                  <Input type="time" value={row.closes} onChange={(event) => setHours((current) => current.map((item) => (item.day === row.day ? { ...item, closes: event.target.value } : item)))} />
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={row.open} onCheckedChange={(open) => setHours((current) => current.map((item) => (item.day === row.day ? { ...item, open } : item)))} />
                    {row.open ? "Open" : "Closed"}
                  </label>
                </div>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
              <Input value={holidayName} onChange={(event) => setHolidayName(event.target.value)} placeholder="Holiday name" />
              <Input type="date" value={holidayDate} onChange={(event) => setHolidayDate(event.target.value)} />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!holidayName || !holidayDate) return;
                  setHolidays((current) => [...current, { id: createId("hol"), name: holidayName, date: holidayDate, closure: "full", opens: "09:00", closes: "17:00" }]);
                  setHolidayName("");
                  setHolidayDate("");
                }}
              >
                Add holiday
              </Button>
            </div>
            <ul className="text-sm text-muted">
              {holidays.map((holiday) => (
                <li key={holiday.id}>
                  {holiday.date} · {holiday.name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {step === 3 ? (
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm">
              Delivery configuration
              <Switch checked={values.deliveryEnabled} onCheckedChange={(deliveryEnabled) => form.setValue("deliveryEnabled", deliveryEnabled)} />
            </label>
            <label className="flex items-center justify-between text-sm">
              Pickup configuration
              <Switch checked={values.pickupEnabled} onCheckedChange={(pickupEnabled) => form.setValue("pickupEnabled", pickupEnabled)} />
            </label>
            <label className="flex items-center justify-between text-sm">
              Notification configuration
              <Switch checked={values.notificationsEnabled} onCheckedChange={(notificationsEnabled) => form.setValue("notificationsEnabled", notificationsEnabled)} />
            </label>
            <Field label="Assigned manager" error={form.formState.errors.manager?.message}>
              <Input {...form.register("manager")} />
            </Field>
            <Field label="Location status">
              <Select {...form.register("status")}>
                <option value="pending">Pending configuration</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Field>
          </div>
        ) : null}
        {step === 4 ? (
          <dl className="grid gap-3 text-sm md:grid-cols-2">
            {[
              ["Legal name", values.legalName],
              ["Operating name", values.operatingName],
              ["Code", values.code],
              ["Pharmacist-in-charge", values.pharmacistInCharge],
              ["Address", `${values.street}, ${values.city} ${values.province} ${values.postalCode}`],
              ["Phone", values.phone],
              ["Email", values.email],
              ["Time zone", values.timeZone],
              ["Manager", values.manager],
              ["Status", values.status],
              ["Open days", String(hours.filter((day) => day.open).length)],
              ["Holidays", String(holidays.length)],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-line pb-2">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="font-medium">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Section>
      <div className="mt-4 flex justify-between">
        <Button type="button" variant="secondary" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button type="button" onClick={next}>
            Continue
          </Button>
        ) : (
          <Button type="submit">Save location</Button>
        )}
      </div>
    </form>
  );
}
