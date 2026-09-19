"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** YouTube chip row — horizontal scroll, no visible scrollbar, edge fade. */
export function ChipScroller({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <div
        className={cn(
          "hide-scrollbar flex gap-1.5 overflow-x-auto overscroll-x-contain touch-pan-x scroll-smooth sm:gap-2",
          "px-2.5 pr-7 sm:px-4 sm:pr-10",
        )}
      >
        {children}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background from-40% to-transparent sm:w-10"
      />
    </div>
  );
}
