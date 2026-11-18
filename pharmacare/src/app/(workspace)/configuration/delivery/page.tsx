import type { Metadata } from "next";
import { DeliveryConfiguration } from "@/components/cpos/pages/delivery-configuration";

export const metadata: Metadata = { title: "Delivery configuration" };

export default function DeliveryPage() {
  return <DeliveryConfiguration />;
}
