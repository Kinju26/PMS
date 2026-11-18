"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/cpos/data-table";
import { Field, PageHeader, Section, Select } from "@/components/cpos/fields";
import { HOLIDAY_TYPES } from "@/lib/cpos/constants";
import { holidaySchema } from "@/lib/cpos/schemas";
import { useCpos } from "@/lib/cpos/store";
import { createId } from "@/lib/utils";
import type { Holiday, HolidayType } from "@/types/cpos";
import type { z } from "zod";

type HolidayFormValues = z.infer<typeof holidaySchema>;

const emptyHoliday = (): HolidayFormValues => ({
  id: "hol-new",
  name: "",
  date: "",
  holidayType: "Statutory",
  closure: "full",
  opens: "09:00",
  closes: "17:00",
});

export function HolidaySchedule() {
  const { state, saveHoliday, deleteHoliday } = useCpos();
  const [editing, setEditing] = useState<HolidayFormValues | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Holiday | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "full" | "special">("all");

  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(holidaySchema),
    defaultValues: emptyHoliday(),
  });
  const closureValue = useWatch({ control: form.control, name: "closure" });

  function openEditor(holiday?: Holiday) {
    const next: HolidayFormValues = holiday
      ? {
          ...holiday,
          holidayType: (holiday.holidayType ?? "Statutory") as HolidayType,
        }
      : { ...emptyHoliday(), id: createId("hol") };
    setEditing(next);
    form.reset(next);
  }

  const filteredHolidays = useMemo(() => {
    return [...state.holidays]
      .filter((row) => {
        const rowType = row.holidayType ?? "Statutory";
        const matchesType = typeFilter === "all" || rowType === typeFilter;
        const matchesStatus = statusFilter === "all" || row.closure === statusFilter;
        return matchesType && matchesStatus;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [state.holidays, statusFilter, typeFilter]);

  const fullClosureCount = state.holidays.filter((h) => h.closure === "full").length;
  const modifiedCount = state.holidays.filter((h) => h.closure === "special").length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        eyebrow="Phase 0 · Pharmacy Configuration"
        title="Holiday Schedule"
        description="Manage statutory, provincial, civic, and pharmacy-specific holiday closures or modified operating hours."
        status={<Badge tone="neutral">Demonstration Data</Badge>}
        actions={
          <Button type="button" onClick={() => openEditor()}>
            <Plus className="h-4 w-4" />
            Add Holiday
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[#DCE3EA] bg-white px-4 py-3">
          <p className="text-xs font-medium text-muted">Scheduled Holidays</p>
          <p className="mt-1 text-2xl font-bold text-ink tabular-nums">{state.holidays.length}</p>
        </div>
        <div className="rounded-lg border border-[#DCE3EA] bg-white px-4 py-3">
          <p className="text-xs font-medium text-muted">Closed All Day</p>
          <p className="mt-1 text-2xl font-bold text-ink tabular-nums">{fullClosureCount}</p>
        </div>
        <div className="rounded-lg border border-[#DCE3EA] bg-white px-4 py-3">
          <p className="text-xs font-medium text-muted">Modified Hours</p>
          <p className="mt-1 text-2xl font-bold text-ink tabular-nums">{modifiedCount}</p>
        </div>
      </div>

      <Section
        title="Holiday List"
        description={`Sorted chronologically in ${state.regional.timeZone}.`}
      >
        <DataTable
          rows={filteredHolidays}
          searchPlaceholder="Search holiday name, date, or type..."
          getSearchText={(row) => `${row.name} ${row.date} ${row.holidayType ?? "Statutory"}`}
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                aria-label="Filter by holiday type"
                className="h-10 w-full sm:w-44"
              >
                <option value="all">All types</option>
                {HOLIDAY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              <Select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | "full" | "special")
                }
                aria-label="Filter by hours status"
                className="h-10 w-full sm:w-40"
              >
                <option value="all">All statuses</option>
                <option value="full">Closed</option>
                <option value="special">Modified Hours</option>
              </Select>
            </div>
          }
          columns={[
            {
              key: "name",
              header: "Holiday Name",
              cell: (row) => (
                <div className="flex items-center gap-2 font-semibold text-ink">
                  <CalendarDays className="h-4 w-4 shrink-0 text-[#087f8c]" />
                  {row.name}
                </div>
              ),
            },
            {
              key: "date",
              header: "Holiday Date",
              cell: (row) => <span className="font-mono text-xs tabular-nums">{row.date}</span>,
            },
            {
              key: "type",
              header: "Holiday Type",
              cell: (row) => <Badge tone="neutral">{row.holidayType ?? "Statutory"}</Badge>,
            },
            {
              key: "closure",
              header: "Closed / Modified",
              cell: (row) => (
                <Badge tone={row.closure === "full" ? "danger" : "warning"}>
                  {row.closure === "full" ? "Closed" : "Modified Hours"}
                </Badge>
              ),
            },
            {
              key: "hours",
              header: "Opening – Closing",
              cell: (row) => (
                <span className="font-mono text-xs text-muted tabular-nums">
                  {row.closure === "full" ? "Closed" : `${row.opens} – ${row.closes}`}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              cell: (row) => (
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => openEditor(row)}>
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setPendingDelete(row)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Section>

      {/* Add / Edit Holiday Modal */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={
          editing && state.holidays.some((item) => item.id === editing.id)
            ? "Edit Holiday"
            : "Add Holiday"
        }
        description="Specify whether the pharmacy is closed all day or operating under modified hours."
      >
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit((values) => {
            saveHoliday(values);
            setEditing(null);
          })}
        >
          <Field
            label="Holiday Name"
            htmlFor="holiday-name"
            required
            error={form.formState.errors.name?.message}
          >
            <Input id="holiday-name" placeholder="e.g., Civic Holiday" {...form.register("name")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Holiday Date"
              htmlFor="holiday-date"
              required
              error={form.formState.errors.date?.message}
            >
              <Input id="holiday-date" type="date" {...form.register("date")} />
            </Field>
            <Field label="Holiday Type" htmlFor="holiday-type" required>
              <Select id="holiday-type" {...form.register("holidayType")}>
                {HOLIDAY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Closed or Modified Hours" htmlFor="closure" required>
            <Select id="closure" {...form.register("closure")}>
              <option value="full">Closed (Full Day)</option>
              <option value="special">Modified Hours</option>
            </Select>
          </Field>
          {closureValue === "special" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Opening Time" required>
                <Input type="time" {...form.register("opens")} />
              </Field>
              <Field
                label="Closing Time"
                required
                error={form.formState.errors.closes?.message}
              >
                <Input type="time" {...form.register("closes")} />
              </Field>
            </div>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit">Save Holiday</Button>
          </div>
        </form>
      </Dialog>

      {/* Destructive Confirmation Dialog */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete holiday?"
        description={
          pendingDelete
            ? `Permanently remove "${pendingDelete.name}" (${pendingDelete.date}) from the holiday schedule?`
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
              if (pendingDelete) deleteHoliday(pendingDelete.id);
              setPendingDelete(null);
            }}
          >
            Delete Holiday
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
