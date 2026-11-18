import type { Metadata } from "next";
import { Suspense } from "react";
import { LocationDetail } from "@/components/cpos/pages/location-detail";

export const metadata: Metadata = { title: "Location" };

async function LocationContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LocationDetail id={id} />;
}

export default function LocationPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-10 w-64 animate-pulse rounded bg-[#E6ECF1]" />
          <div className="h-56 animate-pulse rounded-lg border border-[#DCE3EA] bg-white" />
        </div>
      }
    >
      <LocationContent params={params} />
    </Suspense>
  );
}
