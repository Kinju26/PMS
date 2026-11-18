import type { Metadata } from "next";
import { LocationPricing } from "@/components/cpos/pages/location-pricing";

export const metadata: Metadata = { title: "Location pricing" };

export default function PricingPage() {
  return <LocationPricing />;
}
