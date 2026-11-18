import type { Metadata } from "next";
import { WorkflowConfiguration } from "@/components/cpos/pages/workflow-configuration";

export const metadata: Metadata = { title: "Workflow configuration" };

export default function WorkflowsPage() {
  return <WorkflowConfiguration />;
}
