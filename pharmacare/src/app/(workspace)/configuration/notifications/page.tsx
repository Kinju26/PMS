import type { Metadata } from "next";
import { NotificationConfiguration } from "@/components/cpos/pages/notification-configuration";

export const metadata: Metadata = { title: "Notification configuration" };

export default function NotificationsPage() {
  return <NotificationConfiguration />;
}
