import type { Metadata } from "next";
import { LocationInventory } from "@/components/cpos/pages/location-inventory";

export const metadata: Metadata = { title: "Location inventory" };

export default function InventoryPage() {
  return <LocationInventory />;
}
