import type { Metadata } from "next";
import { PermissionsMatrix } from "@/components/cpos/pages/permissions-matrix";

export const metadata: Metadata = { title: "Permissions Matrix" };

export default function PermissionsPage() {
  return <PermissionsMatrix />;
}

