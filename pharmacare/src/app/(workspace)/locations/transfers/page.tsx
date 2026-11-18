import type { Metadata } from "next";
import { TransferList } from "@/components/cpos/pages/transfers";

export const metadata: Metadata = { title: "Inter-store transfers" };

export default function TransfersPage() {
  return <TransferList />;
}
