import type { Metadata } from "next";
import { ContactInformation } from "@/components/cpos/pages/contact-information";

export const metadata: Metadata = { title: "Contact information" };

export default function ContactPage() {
  return <ContactInformation />;
}
