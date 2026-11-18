import type { Metadata } from "next";
import { LocationUsers } from "@/components/cpos/pages/location-users";

export const metadata: Metadata = { title: "Location users" };

export default function UsersPage() {
  return <LocationUsers />;
}
