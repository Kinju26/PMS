import type { Metadata } from "next";
import { RolesManagement } from "@/components/cpos/pages/roles-management";

export const metadata: Metadata = { title: "Roles" };

export default function RolesPage() {
  return <RolesManagement />;
}

