import type { Metadata } from "next";
import { PharmacistInChargePageView } from "@/components/cpos/pages/pharmacist-in-charge";

export const metadata: Metadata = { title: "Pharmacist-in-Charge" };

export default function PharmacistInChargePage() {
  return <PharmacistInChargePageView />;
}

