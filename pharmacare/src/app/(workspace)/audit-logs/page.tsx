import type { Metadata } from "next";
import { AuditLogsPageView } from "@/components/cpos/pages/audit-logs";

export const metadata: Metadata = { title: "Audit Logs" };

export default function AuditLogsPage() {
  return <AuditLogsPageView />;
}

