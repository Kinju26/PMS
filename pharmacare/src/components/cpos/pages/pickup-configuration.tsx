"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Clock3, Lock, Package, ShieldCheck } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Field, PageHeader, Section, Select } from "@/components/cpos/fields";
import { pickupSchema } from "@/lib/cpos/schemas";
import { useCpos } from "@/lib/cpos/store";
import type { PickupConfig } from "@/types/cpos";

export function PickupConfiguration() {
  const { state, savePickup } = useCpos();
  const form = useForm<PickupConfig>({
    resolver: zodResolver(pickupSchema),
    defaultValues: state.pickup,
  });

  const watched = useWatch({ control: form.control });

  return (
    <form className="mx-auto max-w-5xl space-y-5" onSubmit={form.handleSubmit(savePickup)}>
      <PageHeader
        eyebrow="Phase 0 · Pharmacy Configuration"
        title="Pickup Configuration"
        description="Configure counter pickup availability, pickup hours, patient instructions, and review future Will-Call workflow placeholders."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => form.reset(state.pickup)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </>
        }
      />

      {/* Status Banner */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <p className="text-xs font-medium text-muted">Pickup Status</p>
          <div className="mt-1.5">
            <Badge tone={watched.enabled ? "success" : "neutral"} className="rounded-full">
              {watched.enabled ? "Pickup Available" : "Pickup Disabled"}
            </Badge>
          </div>
        </div>
        <div className="rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <p className="text-xs font-medium text-muted">Pickup Hours Mode</p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {watched.pickupHoursMode === "custom"
              ? `Custom (${watched.pickupOpens ?? "09:00"} – ${watched.pickupCloses ?? "19:30"})`
              : "Matches Pharmacy Hours"}
          </p>
        </div>
        <div className="rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <p className="text-xs font-medium text-muted">Will-Call Automation</p>
          <div className="mt-1.5">
            <Badge tone="warning" className="rounded-full">
              Planned · Phase 8
            </Badge>
          </div>
        </div>
      </div>

      {/* Store Pickup & Instructions */}
      <Section
        title="Pickup Availability & Instructions"
        description="Inform staff and patients how prescription collection works at the dispensary counter."
      >
        <div className="grid gap-4">
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-[#F8FBFD] p-3.5 text-sm">
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#E7F6F1] text-[#1D9E75]">
                <Package className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-semibold text-ink">Enable in-pharmacy pickup</span>
                <span className="block text-xs text-muted">
                  Allow patients to collect released prescriptions at the dispensary counter.
                </span>
              </span>
            </span>
            <Switch
              checked={Boolean(watched.enabled)}
              onCheckedChange={(enabled) => form.setValue("enabled", enabled)}
              aria-label="Enable in-pharmacy pickup"
            />
          </label>

          <Field
            label="Pickup Instructions"
            htmlFor="pickup-instructions"
            error={form.formState.errors.instructions?.message}
          >
            <Textarea id="pickup-instructions" rows={3} {...form.register("instructions")} />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Pickup Availability Description"
              htmlFor="pickup-availability"
              error={form.formState.errors.availability?.message}
            >
              <Input id="pickup-availability" {...form.register("availability")} />
            </Field>
            <Field
              label="Estimated Ready / Prep Time"
              htmlFor="pickup-eta"
              error={form.formState.errors.eta?.message}
            >
              <Input id="pickup-eta" {...form.register("eta")} />
            </Field>
          </div>
        </div>
      </Section>

      {/* Pickup Hours & Verification Rules */}
      <Section
        title="Pickup Hours & Counter Configuration"
        description={`Hours operate in ${state.regional.timeZone}.`}
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Pickup Hours Schedule" htmlFor="pickupHoursMode">
              <Select id="pickupHoursMode" {...form.register("pickupHoursMode")}>
                <option value="same-as-pharmacy">Same as Pharmacy Operating Hours</option>
                <option value="custom">Custom Pickup Window</option>
              </Select>
            </Field>
            <Field label="Pickup Opens">
              <Input
                type="time"
                disabled={watched.pickupHoursMode !== "custom"}
                {...form.register("pickupOpens")}
              />
            </Field>
            <Field
              label="Pickup Closes"
              error={form.formState.errors.pickupCloses?.message}
            >
              <Input
                type="time"
                disabled={watched.pickupHoursMode !== "custom"}
                {...form.register("pickupCloses")}
              />
            </Field>
          </div>

          <div className="divide-y divide-line border-t border-line pt-2">
            <label className="flex cursor-pointer items-start justify-between gap-4 py-3 text-sm">
              <span>
                <span className="block font-medium text-ink">Require patient ID / DOB verification</span>
                <span className="text-xs text-muted">
                  Prompt counter staff to verify two patient identifiers before releasing a prescription bag.
                </span>
              </span>
              <Switch
                checked={Boolean(watched.requireIdVerification)}
                onCheckedChange={(value) => form.setValue("requireIdVerification", value)}
              />
            </label>
            <label className="flex cursor-pointer items-start justify-between gap-4 py-3 text-sm">
              <span>
                <span className="block font-medium text-ink">Offer curbside pickup option</span>
                <span className="text-xs text-muted">
                  Indicate curbside collection availability for mobility-assisted or symptomatic patients.
                </span>
              </span>
              <Switch
                checked={Boolean(watched.curbsideEnabled)}
                onCheckedChange={(value) => form.setValue("curbsideEnabled", value)}
              />
            </label>
            <label className="flex cursor-pointer items-start justify-between gap-4 py-3 text-sm">
              <span>
                <span className="block font-medium text-ink">Ready-for-pickup notification preference</span>
                <span className="text-xs text-muted">
                  Preference flag for notifying consented patients upon release (notification gateway pending backend).
                </span>
              </span>
              <Switch
                checked={Boolean(watched.notifyReady)}
                onCheckedChange={(value) => form.setValue("notifyReady", value)}
              />
            </label>
            <label className="flex cursor-pointer items-start justify-between gap-4 py-3 text-sm">
              <span>
                <span className="block font-medium text-ink">Pickup delay notice preference</span>
                <span className="text-xs text-muted">
                  Preference flag when wait time exceeds the posted pickup estimate.
                </span>
              </span>
              <Switch
                checked={Boolean(watched.notifyDelay)}
                onCheckedChange={(value) => form.setValue("notifyDelay", value)}
              />
            </label>
          </div>
        </div>
      </Section>

      {/* Will-Call Placeholders for Phase 8 */}
      <Section
        title="Will-Call Settings (Phase 8 Placeholder)"
        description="Reserved configuration structure for Phase 8: Pickup / Will-Call. Read-only in Phase 0 until dispensing and bag tracking workflows are implemented."
        action={
          <Badge tone="neutral" className="gap-1 rounded-full">
            <Lock className="h-3 w-3" />
            Phase 8 Roadmap
          </Badge>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              icon: Package,
              title: "Will-Call Bin Numbering",
              body: "Alphabetical or numeric hanging-bag bin ranges and fridge/narcotic segregation flags.",
            },
            {
              icon: Clock3,
              title: "Return-to-Stock Policy",
              body: "Configurable unclaimed prescription hold window (e.g., 14 days) and automated claim reversal trigger.",
            },
            {
              icon: ShieldCheck,
              title: "Counselling & Signature Capture",
              body: "Mandatory pharmacist counselling stops, electronic signature pad capture, and third-party pickup logs.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-dashed border-[#D5E4EA] bg-[#F8FBFD] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-muted ring-1 ring-[#E6EEF2]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-muted ring-1 ring-[#E6EEF2]">
                    Not active yet
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{item.body}</p>
              </div>
            );
          })}
        </div>
      </Section>
    </form>
  );
}
