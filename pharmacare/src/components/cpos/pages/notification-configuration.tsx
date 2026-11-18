"use client";

import { Bell, Info, Mail, MessageSquare, Smartphone } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Section } from "@/components/cpos/fields";
import { useCpos } from "@/lib/cpos/store";
import type { NotificationKey, NotificationSetting } from "@/types/cpos";

function channelIcon(key: NotificationKey) {
  switch (key) {
    case "email":
      return Mail;
    case "sms":
      return MessageSquare;
    case "push":
      return Smartphone;
    default:
      return Bell;
  }
}

export function NotificationConfiguration() {
  const { state, saveNotifications } = useCpos();
  const [settings, setSettings] = useState<NotificationSetting[]>(state.notifications);

  const channels = settings.filter((item) => item.group === "channel");
  const events = settings.filter((item) => item.group === "event");
  const enabledCount = settings.filter((item) => item.enabled).length;

  function toggleSetting(key: NotificationKey, enabled: boolean) {
    setSettings((current) =>
      current.map((item) => (item.key === key ? { ...item, enabled } : item)),
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        eyebrow="Phase 0 · Pharmacy Configuration"
        title="Notification Configuration"
        description="Define preferred communication channels and clinical/operational reminder events. Patient messages require documented consent under Canadian privacy regulations (PIPEDA / PHIPA)."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => setSettings(state.notifications)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => saveNotifications(settings)}>
              Save preferences
            </Button>
          </>
        }
      />

      {/* Explicit Not-Connected Integration Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-xs text-amber-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p>
          <span className="font-semibold">Notification Integrations Not Connected Yet:</span>{" "}
          Email SMTP, Canadian SMS gateways, and mobile push services are not live in Phase 0. Toggling options below stores your preferred pharmacy policy for when backend messaging services are connected.
        </p>
      </div>

      {/* Summary Bar */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <p className="text-xs font-medium text-muted">Preferences Enabled</p>
          <p className="mt-1 text-2xl font-bold text-ink tabular-nums">
            {enabledCount} / {settings.length}
          </p>
        </div>
        <div className="rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <p className="text-xs font-medium text-muted">Channels Configured</p>
          <p className="mt-1 text-2xl font-bold text-ink tabular-nums">
            {channels.filter((c) => c.enabled).length} / {channels.length}
          </p>
        </div>
        <div className="rounded-xl border border-[#E6EEF2] bg-white px-4 py-3.5">
          <p className="text-xs font-medium text-muted">Live Gateway Status</p>
          <div className="mt-1.5">
            <Badge tone="warning" className="rounded-full">
              Not Connected · Phase 0
            </Badge>
          </div>
        </div>
      </div>

      {/* Delivery Channels */}
      <Section
        title="Delivery Channels"
        description="Choose which transport channels this pharmacy intends to support once messaging gateways are integrated."
      >
        <div className="divide-y divide-line">
          {channels.map((setting) => {
            const Icon = channelIcon(setting.key);
            return (
              <label
                key={setting.key}
                className="flex cursor-pointer items-start justify-between gap-4 py-4 first:pt-1 last:pb-1"
              >
                <span className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F4F8FB] text-[#087f8c]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink">{setting.label}</span>
                      <Badge tone="warning" className="rounded-full text-[10px]">
                        Not connected yet
                      </Badge>
                    </span>
                    <span className="mt-1 block max-w-2xl text-xs text-muted">
                      {setting.description}
                    </span>
                    <span className="mt-1 block text-[11px] font-medium text-amber-700/90">
                      {setting.integrationNote}
                    </span>
                  </span>
                </span>
                <Switch
                  checked={setting.enabled}
                  aria-label={setting.label}
                  onCheckedChange={(enabled) => toggleSetting(setting.key, enabled)}
                />
              </label>
            );
          })}
        </div>
      </Section>

      {/* Event Preferences */}
      <Section
        title="Patient & Workflow Notification Preferences"
        description="Select which pharmacy lifecycle events should trigger patient notifications once downstream phases are active."
      >
        <div className="divide-y divide-line">
          {events.map((setting) => (
            <label
              key={setting.key}
              className="flex cursor-pointer items-start justify-between gap-4 py-4 first:pt-1 last:pb-1"
            >
              <span>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{setting.label}</span>
                  <Badge tone="neutral" className="rounded-full text-[10px]">
                    Pending backend hook
                  </Badge>
                </span>
                <span className="mt-1 block max-w-2xl text-xs text-muted">
                  {setting.description}
                </span>
                <span className="mt-1 block text-[11px] text-muted/90">
                  {setting.integrationNote}
                </span>
              </span>
              <Switch
                checked={setting.enabled}
                aria-label={setting.label}
                onCheckedChange={(enabled) => toggleSetting(setting.key, enabled)}
              />
            </label>
          ))}
        </div>
      </Section>
    </div>
  );
}
