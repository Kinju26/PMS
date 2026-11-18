import type { Metadata } from "next";
import { RegulatoryConfiguration } from "@/components/cpos/pages/regulatory-configuration";

export const metadata: Metadata = { title: "Regulatory Configuration" };

export default function RegulatoryConfigurationPage() {
  return <RegulatoryConfiguration />;
}

