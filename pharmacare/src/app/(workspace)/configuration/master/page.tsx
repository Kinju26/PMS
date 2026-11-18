import type { Metadata } from "next";
import { MasterConfigurationHub } from "@/components/cpos/pages/master-configuration-hub";

export const metadata: Metadata = { title: "Master Configuration" };

export default function MasterConfigurationPage() {
  return <MasterConfigurationHub />;
}

