import type { Metadata } from "next";
import { LocationWizard } from "@/components/cpos/pages/location-wizard";

export const metadata: Metadata = { title: "Add location" };

export default function NewLocationPage() {
  return <LocationWizard />;
}
