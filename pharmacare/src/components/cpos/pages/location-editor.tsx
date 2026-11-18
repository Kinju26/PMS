"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/cpos/fields";
import { LocationWizard } from "@/components/cpos/pages/location-wizard";
import { useCpos } from "@/lib/cpos/store";

export function LocationEditor({ id }: { id: string }) {
  const { state } = useCpos();
  const location = state.locations.find((item) => item.id === id);
  if (!location) {
    return (
      <PageHeader
        title="Location not found"
        description="This location is not in the current session."
        actions={
          <Button asChild variant="secondary">
            <Link href="/locations">Back to locations</Link>
          </Button>
        }
      />
    );
  }
  return <LocationWizard location={location} />;
}
