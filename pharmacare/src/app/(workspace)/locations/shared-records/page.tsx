import type { Metadata } from "next";
import { SharedRecords } from "@/components/cpos/pages/shared-records";

export const metadata: Metadata = { title: "Shared patient records" };

export default function SharedRecordsPage() {
  return <SharedRecords />;
}
