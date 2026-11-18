import type { Metadata } from "next";
import { HolidaySchedule } from "@/components/cpos/pages/holiday-schedule";

export const metadata: Metadata = { title: "Holiday schedule" };

export default function HolidaysPage() {
  return <HolidaySchedule />;
}
