import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "PharmaCare Enterprise — Secure Sign In",
  description:
    "Sign in to manage your pharmacy operations, inventory, and clinical dispensing.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
