"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
}

export function UnsavedChangesBar({
  dirty,
  onDiscard,
  onSave,
  saveLabel = "Save Changes",
  saveType = "button",
}: {
  dirty: boolean;
  onDiscard: () => void;
  onSave?: () => void;
  saveLabel?: string;
  saveType?: "button" | "submit";
}) {
  useUnsavedChangesWarning(dirty);

  if (!dirty) return null;

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-950 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
        <p>
          <span className="font-semibold">Unsaved changes detected.</span> Review your edits and save before leaving this screen.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={onDiscard}>
          Discard
        </Button>
        <Button type={saveType} size="sm" onClick={saveType === "button" ? onSave : undefined}>
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}

