"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, PageHeader, Section, Select } from "@/components/cpos/fields";
import { DATE_FORMATS, LANGUAGES, PROVINCES, TIME_ZONES } from "@/lib/cpos/constants";
import { contactSchema } from "@/lib/cpos/schemas";
import { useCpos } from "@/lib/cpos/store";
import type { z } from "zod";

type ContactForm = z.infer<typeof contactSchema>;

export function ContactInformation() {
  const { state, saveContact } = useCpos();
  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { ...state.contact, ...state.regional },
  });

  return (
    <form
      className="mx-auto max-w-5xl space-y-5"
      onSubmit={form.handleSubmit((values) => {
        const { timeZone, dateFormat, timeFormat, currency, language, ...contact } = values;
        saveContact(contact, { timeZone, dateFormat, timeFormat, currency, language });
      })}
    >
      <PageHeader
        eyebrow="Pharmacy & Master Configuration"
        title="Contact and region"
        description="Where this pharmacy can be reached, and how dates, time, and currency are shown."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => form.reset({ ...state.contact, ...state.regional })}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </>
        }
      />
      <Section title="Contact information">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Street address" htmlFor="street" error={form.formState.errors.street?.message} className="md:col-span-2">
            <Input id="street" {...form.register("street")} />
          </Field>
          <Field label="Suite / unit" htmlFor="suite">
            <Input id="suite" {...form.register("suite")} />
          </Field>
          <Field label="City" htmlFor="city" error={form.formState.errors.city?.message}>
            <Input id="city" {...form.register("city")} />
          </Field>
          <Field label="Province" htmlFor="province">
            <Select id="province" {...form.register("province")}>
              {PROVINCES.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Postal code" htmlFor="postalCode" error={form.formState.errors.postalCode?.message}>
            <Input id="postalCode" {...form.register("postalCode")} />
          </Field>
          <Field label="Country" htmlFor="country">
            <Input id="country" {...form.register("country")} />
          </Field>
          <Field label="Phone number" htmlFor="phone" error={form.formState.errors.phone?.message}>
            <Input id="phone" {...form.register("phone")} />
          </Field>
          <Field label="Fax number" htmlFor="fax">
            <Input id="fax" {...form.register("fax")} />
          </Field>
          <Field label="Email address" htmlFor="email" error={form.formState.errors.email?.message} className="md:col-span-2">
            <Input id="email" type="email" {...form.register("email")} />
          </Field>
        </div>
      </Section>
      <Section title="Regional and time configuration">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Time zone" htmlFor="timeZone">
            <Select id="timeZone" {...form.register("timeZone")}>
              {TIME_ZONES.map((zone) => (
                <option key={zone}>{zone}</option>
              ))}
            </Select>
          </Field>
          <Field label="Date format" htmlFor="dateFormat">
            <Select id="dateFormat" {...form.register("dateFormat")}>
              {DATE_FORMATS.map((format) => (
                <option key={format}>{format}</option>
              ))}
            </Select>
          </Field>
          <Field label="Time format" htmlFor="timeFormat">
            <Select id="timeFormat" {...form.register("timeFormat")}>
              <option value="24-hour">24-hour</option>
              <option value="12-hour">12-hour</option>
            </Select>
          </Field>
          <Field label="Currency" htmlFor="currency">
            <Select id="currency" {...form.register("currency")}>
              <option value="CAD">CAD — Canadian dollar</option>
            </Select>
          </Field>
          <Field label="Default language" htmlFor="language">
            <Select id="language" {...form.register("language")}>
              {LANGUAGES.map((language) => (
                <option key={language}>{language}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>
    </form>
  );
}
