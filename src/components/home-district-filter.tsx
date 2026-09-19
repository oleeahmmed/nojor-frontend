"use client";

import { ChevronDown, MapPin, X } from "lucide-react";
import { useApp } from "./providers";
import { cn } from "@/lib/utils";

/** Opens the area picker modal — no native select, no extra page. */
export function HomeDistrictFilter({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { homeDistrict, setHomeDistrict, role, district, openAreaPicker } =
    useApp();

  if (role === "official" && district) {
    return (
      <p
        className={cn(
          "shrink-0 truncate text-[12px] font-medium text-muted-foreground",
          className,
        )}
      >
        {district}
      </p>
    );
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-1", className)}>
      <button
        type="button"
        onClick={openAreaPicker}
        className={cn(
          "inline-flex min-w-0 items-center gap-1 rounded-full bg-secondary font-medium hover:bg-secondary/80",
          compact
            ? "h-8 max-w-[7.5rem] px-2.5 text-[12px] sm:max-w-[9rem]"
            : "h-8 max-w-full px-3 text-sm",
        )}
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
