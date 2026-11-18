import type { Metadata } from "next";
import { PickupConfiguration } from "@/components/cpos/pages/pickup-configuration";

export const metadata: Metadata = { title: "Pickup configuration" };

export default function PickupPage() {
  return <PickupConfiguration />;
}
