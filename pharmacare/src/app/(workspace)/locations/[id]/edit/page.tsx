import type { Metadata } from "next";
import { Suspense } from "react";
import { LocationEditor } from "@/components/cpos/pages/location-editor";

export const metadata: Metadata = { title: "Edit location" };

async function EditLocationContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LocationEditor id={id} />;
}

export default function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-10 w-64 animate-pulse rounded bg-[#E6ECF1]" />
          <div className="h-64 animate-pulse rounded-lg border border-[#DCE3EA] bg-white" />
        </div>
      }
    >
      <EditLocationContent params={params} />
    </Suspense>
  );
}
