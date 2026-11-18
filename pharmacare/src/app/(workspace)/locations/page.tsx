import type { Metadata } from "next";
import { LocationOverview } from "@/components/cpos/pages/location-overview";

export const metadata: Metadata = { title: "Location overview" };

export default function LocationsPage() {
  return <LocationOverview />;
}
