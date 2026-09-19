"use client";

import { ChevronDown, MapPin, X } from "lucide-react";
import { useApp } from "./providers";
import { cn } from "@/lib/utils";

/** Opens the area picker modal — no native select, no extra page. */
export function HomeDistrictFilter({ className }: { className?: string }) {
  const { homeDistrict, setHomeDistrict, role, district, openAreaPicker } =
    useApp();

  if (role === "official" && district) return null;

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={openAreaPicker}
        className="inline-flex h-8 min-w-0 max-w-full items-center gap-1.5 rounded-full bg-secondary px-3 text-sm font-medium hover:bg-secondary/80"
      >
        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{homeDistrict || "এলাকা"}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>
      {homeDistrict ? (
        <button
          type="button"
          onClick={() => setHomeDistrict("")}
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="জেলা ফিল্টার সরান"
          title="সব জেলা দেখুন"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
