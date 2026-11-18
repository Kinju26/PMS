"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Copy, Globe2, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, Field, PageHeader, Section, Select } from "@/components/cpos/fields";
import { UnsavedChangesBar } from "@/components/cpos/unsaved-bar";
import { DAYS } from "@/lib/cpos/constants";
import { specialHoursSchema } from "@/lib/cpos/schemas";
import { useCpos } from "@/lib/cpos/store";
import { createId } from "@/lib/utils";
import type { DayHours, DayKey, SpecialHoursEntry } from "@/types/cpos";

const blankSpecial = (): SpecialHoursEntry => ({
  id: "sh-new",
  label: "",
  date: "",
  opens: "09:00",
  closes: "17:00",
  notes: "",
});

export function OperatingHours() {
  const { state, saveHours, saveSpecialHours, deleteSpecialHours, notify } = useCpos();
  const [hours, setHours] = useState<DayHours[]>(state.hours);
  const [sourceDay, setSourceDay] = useState<DayKey>("monday");
  const [error, setError] = useState("");
  const [editingSpecial, setEditingSpecial] = useState<SpecialHoursEntry | null>(null);
  const [pendingDeleteSpecial, setPendingDeleteSpecial] = useState<SpecialHoursEntry | null>(null);

  const specialForm = useForm<SpecialHoursEntry>({
    resolver: zodResolver(specialHoursSchema),
    defaultValues: blankSpecial(),
  });

  const isDirty = useMemo(
    () => JSON.stringify(hours) !== JSON.stringify(state.hours),
    [hours, state.hours],
  );

  function update(day: DayKey, patch: Partial<DayHours>) {
    setHours((current) => current.map((row) => (row.day === day ? { ...row, ...patch } : row)));
  }

  function copyHoursToOtherDays() {
    const origin = hours.find((row) => row.day === sourceDay);
    if (!origin) return;
    setHours((current) =>
      current.map((row) =>
        row.day === sourceDay
          ? row
          : {
              ...row,
              open: origin.open,
              opens: origin.opens,
              closes: origin.closes,
              hasBreak: origin.hasBreak,
              breakStart: origin.breakStart,
              breakEnd: origin.breakEnd,
            },
      ),
    );
    notify(
      "success",
      "Hours copied",
      `Copied ${DAYS.find((d) => d.key === sourceDay)?.label ?? sourceDay} schedule to all other days. Click Save Schedule to persist.`,
    );
  }

  function saveWeekly() {
    for (const row of hours) {
      if (!row.open) continue;
      if (row.closes <= row.opens) {
        setError("Each open day requires a closing time later than the opening time.");
        notify("error", "Invalid operating hours", "Closing time must be later than opening time.");
        return;
      }
      if (row.hasBreak) {
        const bStart = row.breakStart ?? "";
        const bEnd = row.breakEnd ?? "";
        if (!bStart || !bEnd || bEnd <= bStart || bStart < row.opens || bEnd > row.closes) {
          setError("Break hours must fall within the day's opening and closing times.");
          notify("error", "Invalid break window", "Ensure break start and end are inside operating hours.");
          return;
        }
      }
    }
    setError("");
    saveHours(hours);
  }

  function resetWeekly() {
    setHours(state.hours);
    setError("");
  }

  function openSpecialEditor(entry?: SpecialHoursEntry) {
    const next = entry ?? { ...blankSpecial(), id: createId("sh") };
    setEditingSpecial(next);
    specialForm.reset(next);
  }

  const sortedSpecialHours = [...state.specialHours].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        eyebrow="Phase 0 · Pharmacy Configuration"
        title="Operating Hours"
        description="Maintain weekly dispensary opening times, closing times, pharmacist break windows, and closed days."
        status={
          <Badge tone="brand" className="gap-1">
            <Globe2 className="h-3 w-3" />
            {state.regional.timeZone}
          </Badge>
        }
        actions={
          <>
            <Button type="button" variant="secondary" onClick={resetWeekly} disabled={!isDirty}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Changes
            </Button>
            <Button type="button" onClick={saveWeekly}>
              Save Schedule
            </Button>
          </>
        }
      />

      <UnsavedChangesBar
        dirty={isDirty}
        onDiscard={resetWeekly}
        onSave={saveWeekly}
        saveLabel="Save Schedule"
      />

      {/* Weekly Operating Schedule Table */}
      <Section
        title="Weekly Operating Schedule"
        description={
          error ||
          "Configure standard Monday–Sunday hours. Optional break hours indicate temporary dispensary closures (e.g., pharmacist lunch break)."
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={sourceDay}
              onChange={(event) => setSourceDay(event.target.value as DayKey)}
              aria-label="Source day to copy"
              className="h-9 w-36 text-xs"
            >
              {DAYS.map((day) => (
                <option key={day.key} value={day.key}>
                  From {day.label}
                </option>
              ))}
            </Select>
            <Button type="button" variant="secondary" size="sm" onClick={copyHoursToOtherDays}>
              <Copy className="h-3.5 w-3.5" />
              Copy Hours to Other Days
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto rounded-lg border border-[#DCE3EA]">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="border-b border-[#E6ECF1] bg-[#F8FAFC] text-[11px] font-semibold text-muted uppercase">
              <tr>
                <th className="px-3.5 py-2.5">Day</th>
                <th className="px-3.5 py-2.5">Opening Time</th>
                <th className="px-3.5 py-2.5">Closing Time</th>
                <th className="px-3.5 py-2.5">Break Hours</th>
                <th className="px-3.5 py-2.5 text-right">Closed Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF2F6] bg-white">
              {hours.map((row) => {
                const label = DAYS.find((d) => d.key === row.day)?.label ?? row.day;
                const isClosed = !row.open;
                return (
                  <tr
                    key={row.day}
                    className={isClosed ? "bg-[#F8FAFC]/80 text-muted" : "hover:bg-[#F8FAFC]"}
                  >
                    <td className="px-3.5 py-3 font-semibold text-ink">{label}</td>
                    <td className="px-3.5 py-3">
                      <Input
                        type="time"
                        className="h-9 w-32 text-xs"
                        value={row.opens}
                        disabled={isClosed}
                        aria-label={`${label} opening time`}
                        onChange={(event) => update(row.day, { opens: event.target.value })}
                      />
                    </td>
                    <td className="px-3.5 py-3">
                      <Input
                        type="time"
                        className="h-9 w-32 text-xs"
                        value={row.closes}
                        disabled={isClosed}
                        aria-label={`${label} closing time`}
                        onChange={(event) => update(row.day, { closes: event.target.value })}
                      />
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted">
                          <input
                            type="checkbox"
                            className="form-checkbox h-3.5 w-3.5 rounded border-line text-[#087f8c]"
                            checked={Boolean(row.hasBreak) && !isClosed}
                            disabled={isClosed}
                            onChange={(event) =>
                              update(row.day, {
                                hasBreak: event.target.checked,
                                breakStart: row.breakStart || "13:00",
                                breakEnd: row.breakEnd || "13:30",
                              })
                            }
                          />
                          Break
                        </label>
                        {row.hasBreak && !isClosed ? (
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="time"
                              className="h-8 w-28 text-xs"
                              value={row.breakStart ?? "13:00"}
                              aria-label={`${label} break start`}
                              onChange={(event) =>
                                update(row.day, { breakStart: event.target.value })
                              }
                            />
                            <span className="text-muted">–</span>
                            <Input
                              type="time"
                              className="h-8 w-28 text-xs"
                              value={row.breakEnd ?? "13:30"}
                              aria-label={`${label} break end`}
                              onChange={(event) =>
                                update(row.day, { breakEnd: event.target.value })
                              }
                            />
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted/80">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-right">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <Badge tone={isClosed ? "neutral" : "success"}>
                          {isClosed ? "Closed" : "Open"}
                        </Badge>
                        <Switch
                          checked={isClosed}
                          onCheckedChange={(closed) => update(row.day, { open: !closed })}
                          aria-label={`Mark ${label} closed`}
                        />
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Special Hours Exceptions */}
      <Section
        title="Special Operating Hours"
        description="Date-specific exceptions such as inventory audits or seasonal clinic hours."
        action={
          <Button type="button" size="sm" variant="secondary" onClick={() => openSpecialEditor()}>
            <CalendarPlus className="h-3.5 w-3.5" />
            Add Special Hours
          </Button>
        }
      >
        {sortedSpecialHours.length === 0 ? (
          <EmptyState
            title="No special hours scheduled"
            body="Add date-specific exceptions when hours differ from the weekly schedule."
          />
        ) : (
          <div className="divide-y divide-[#EEF2F6]">
            {sortedSpecialHours.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{entry.label}</span>
                    <Badge tone="brand">{entry.date}</Badge>
                    <Badge tone="warning">
                      {entry.opens} – {entry.closes}
                    </Badge>
                  </div>
                  {entry.notes ? <p className="mt-0.5 text-xs text-muted">{entry.notes}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => openSpecialEditor(entry)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete ${entry.label}`}
                    onClick={() => setPendingDeleteSpecial(entry)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Dialog
        open={editingSpecial !== null}
        onOpenChange={(open) => !open && setEditingSpecial(null)}
        title="Special Operating Hours"
      >
        <form
          className="grid gap-4"
          onSubmit={specialForm.handleSubmit((values) => {
            saveSpecialHours(values);
            setEditingSpecial(null);
          })}
        >
          <Field label="Reason / Label" required error={specialForm.formState.errors.label?.message}>
            <Input {...specialForm.register("label")} />
          </Field>
          <Field label="Date" required error={specialForm.formState.errors.date?.message}>
            <Input type="date" {...specialForm.register("date")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Opening Time" required>
              <Input type="time" {...specialForm.register("opens")} />
            </Field>
            <Field
              label="Closing Time"
              required
              error={specialForm.formState.errors.closes?.message}
            >
              <Input type="time" {...specialForm.register("closes")} />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea rows={2} {...specialForm.register("notes")} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditingSpecial(null)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={pendingDeleteSpecial !== null}
        onOpenChange={(open) => !open && setPendingDeleteSpecial(null)}
        title="Delete special hours?"
        description={
          pendingDeleteSpecial
            ? `Remove "${pendingDeleteSpecial.label}" (${pendingDeleteSpecial.date}) from the schedule?`
            : undefined
        }
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setPendingDeleteSpecial(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (pendingDeleteSpecial) deleteSpecialHours(pendingDeleteSpecial.id);
              setPendingDeleteSpecial(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
