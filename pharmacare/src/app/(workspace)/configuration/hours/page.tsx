import type { Metadata } from "next";
import { OperatingHours } from "@/components/cpos/pages/operating-hours";

export const metadata: Metadata = { title: "Operating hours" };

export default function HoursPage() {
  return <OperatingHours />;
}
