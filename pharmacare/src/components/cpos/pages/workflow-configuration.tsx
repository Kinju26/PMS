"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Section } from "@/components/cpos/fields";
import { useCpos } from "@/lib/cpos/store";
import type { WorkflowConfig } from "@/types/cpos";

const rules: { key: keyof WorkflowConfig; title: string; body: string; group: string }[] = [
  { group: "Prescription workflow", key: "pharmacistRelease", title: "Pharmacist release", body: "A pharmacist must release a prescription before it can be sold or picked up." },
  { group: "Approval requirements", key: "dualCheckControlled", title: "Dual check for controlled drugs", body: "A second authorized user must confirm controlled and targeted substances." },
  { group: "Inventory workflow", key: "inventoryApproval", title: "Inventory adjustment approval", body: "Quantity changes above the reorder point need a manager approval." },
  { group: "Transfer approval", key: "transferApproval", title: "Inter-store transfer approval", body: "A transfer cannot leave Draft until an authorized manager approves it." },
  { group: "Notification rules", key: "notifyTransfer", title: "Notify both locations on transfer", body: "Send a message to the source and destination when the status changes." },
  { group: "Notification rules", key: "notifyLowStock", title: "Notify on low stock", body: "Alert the location manager when a product reaches its reorder point." },
];

export function WorkflowConfiguration() {
  const { state, saveWorkflows } = useCpos();
  const [workflows, setWorkflows] = useState<WorkflowConfig>(state.workflows);
  const groups = [...new Set(rules.map((rule) => rule.group))];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader
        eyebrow="Multi-Location Management"
        title="Workflow configuration"
        description="Rules for authorized administrators. They describe how work should move; they do not enforce a clinical decision."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => setWorkflows(state.workflows)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => saveWorkflows(workflows)}>
              Save rules
            </Button>
          </>
        }
      />
      {groups.map((group) => (
        <Section key={group} title={group}>
          <div className="divide-y divide-line">
            {rules
              .filter((rule) => rule.group === group)
              .map((rule) => (
                <label key={rule.key} className="flex items-start justify-between gap-4 py-4">
                  <span>
                    <span className="block text-sm font-medium">{rule.title}</span>
                    <span className="mt-1 block text-sm text-muted">{rule.body}</span>
                  </span>
                  <Switch
                    checked={workflows[rule.key]}
                    aria-label={rule.title}
                    onCheckedChange={(checked) => setWorkflows((current) => ({ ...current, [rule.key]: checked }))}
                  />
                </label>
              ))}
          </div>
        </Section>
      ))}
    </div>
  );
}
