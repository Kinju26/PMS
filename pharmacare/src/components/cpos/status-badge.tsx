import { Badge } from "@/components/ui/badge";

const tones = {
  active: "success",
  received: "success",
  approved: "success",
  healthy: "success",
  pending: "warning",
  low: "warning",
  draft: "warning",
  "in-transit": "brand",
  inactive: "danger",
  cancelled: "danger",
  out: "danger",
} as const;

const labels: Record<string, string> = {
  draft: "Draft",
  pending: "Pending approval",
  approved: "Approved",
  "in-transit": "In transit",
  received: "Received",
  cancelled: "Cancelled",
  active: "Active",
  inactive: "Inactive",
};

export function statusLabel(status: string) {
  return labels[status] ?? status.replaceAll("-", " ");
}

export function StatusBadge({ status }: { status: string }) {
  const tone = status in tones ? tones[status as keyof typeof tones] : "neutral";
  return <Badge tone={tone}>{statusLabel(status)}</Badge>;
}
