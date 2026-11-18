import type { Metadata } from "next";
import { Suspense } from "react";
import { MasterCategoryView } from "@/components/cpos/pages/master-category-views";

export const metadata: Metadata = { title: "Master Configuration" };

async function MasterCategoryContent({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return <MasterCategoryView category={category} />;
}

export default function MasterCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-5 w-44 animate-pulse rounded bg-[#E6ECF1]" />
          <div className="h-12 w-72 animate-pulse rounded bg-[#E6ECF1]" />
          <div className="h-64 animate-pulse rounded-lg border border-[#DCE3EA] bg-white" />
        </div>
      }
    >
      <MasterCategoryContent params={params} />
    </Suspense>
  );
}
