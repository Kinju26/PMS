import type { Metadata } from "next";
import { ConsolidatedReporting } from "@/components/cpos/pages/consolidated-reporting";

export const metadata: Metadata = { title: "Consolidated reporting" };

export default function ReportingPage() {
  return <ConsolidatedReporting />;
}
