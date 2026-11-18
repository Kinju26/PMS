import type { DashboardNotification } from "@/types/cpos";

/**
 * Clearly separated Phase 0 demo notifications & placeholders.
 * No invented live sales/clinical figures are stored here.
 */
export const DASHBOARD_DEMO_LABEL = "Phase 0 · Session Data";

export const demoHeaderNotifications: DashboardNotification[] = [
  {
    id: "notif-1",
    title: "Notification gateways pending backend",
    description: "Email, SMS, and Push preferences are configured locally; external providers are not connected yet.",
    time: "Phase 0 notice",
    severity: "info",
    read: false,
    href: "/configuration/notifications",
  },
  {
    id: "notif-2",
    title: "Review high-risk DUR & verification permissions",
    description: "Confirm Clinical Verification and DUR Override remain restricted to licensed pharmacists.",
    time: "Governance check",
    severity: "warning",
    read: false,
    href: "/access/permissions",
  },
  {
    id: "notif-3",
    title: "Upcoming holiday schedule active",
    description: "Christmas Day & Boxing Day operating exceptions are configured on the calendar.",
    time: "Schedule ready",
    severity: "success",
    read: true,
    href: "/configuration/holidays",
  },
];
