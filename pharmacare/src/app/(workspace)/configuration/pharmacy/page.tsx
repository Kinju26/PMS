import type { Metadata } from "next";
import { PharmacyInformation } from "@/components/cpos/pages/pharmacy-information";

export const metadata: Metadata = { title: "Pharmacy information" };

export default function PharmacyPage() {
  return <PharmacyInformation />;
}
