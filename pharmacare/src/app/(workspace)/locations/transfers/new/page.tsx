import type { Metadata } from "next";
import { TransferForm } from "@/components/cpos/pages/transfers";

export const metadata: Metadata = { title: "Create transfer" };

export default function NewTransferPage() {
  return <TransferForm />;
}
