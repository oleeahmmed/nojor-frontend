"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ArchiveCase } from "@/lib/types";
import { FILTERS, normalizeStatus } from "@/lib/status";
import { CRIME_CATEGORIES } from "@/lib/categories";
import { VideoCard } from "./video-card";
import { HomeDistrictFilter } from "./home-district-filter";
import { ChipScroller } from "./chip-scroller";
import { SmartSearchPanel } from "./smart-search-panel";
import { useApp } from "./providers";
import { cn } from "@/lib/utils";

export function HomeFeed({
  cases,
  view,
  query = "",
}: {
  cases: ArchiveCase[];
  view: string;
  query?: string;
}) {
  const { role, district, homeDistrict } = useApp();
  const router = useRouter();
  const params = useSearchParams();

  const filter = params.get("status") || "all";
  const category = params.get("category") || "all";

  const activeDistrict =
    role === "official" && district ? district : homeDistrict;

  const shown = useMemo(() => {
    let list = [...cases];
    // Soft home-district focus only when no hard district filter in URL
    if (activeDistrict && !params.get("district")) {
      list = list.filter((c) => c.district === activeDistrict);
    }
    if (view === "viral") list = list.filter((c) => c.trend);
    if (view === "trial")
      list = list.filter((c) => normalizeStatus(c.status) === "trial_ongoing");
    if (view === "noaction")
      list = list.filter((c) =>
        ["no_action", "reported"].includes(normalizeStatus(c.status)),
      );
    return list;
  }, [cases, activeDistrict, view, params]);

  function patchParam(key: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    if (!value || value === "all") sp.delete(key);
    else sp.set(key, value);
    const qs = sp.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <div className="w-full min-w-0">
      <div className="sticky top-0 z-20 w-full border-b border-border/50 bg-background">
        {/* Row 1: এলাকা + স্মার্ট সার্চ + স্ট্যাটাস */}
        <div className="flex min-w-0 items-center gap-1.5 px-2.5 py-1.5 sm:gap-2 sm:px-4 sm:py-2">
          {role === "official" && district ? (
            <p className="shrink-0 truncate text-sm">
              কর্মকর্তা — <b>{district}</b>
            </p>
          ) : (
            <HomeDistrictFilter className="shrink-0" />
          )}
          <SmartSearchPanel inline />
          <ChipScroller flush className="min-w-0 flex-1 pb-0">
            {FILTERS.map((f) => {
              const on = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => patchParam("status", f.key)}
                  className={cn(
                    "h-7 shrink-0 rounded-lg px-2.5 text-[12px] font-medium whitespace-nowrap transition sm:h-8 sm:px-3 sm:text-[13px]",
                    on
                      ? "bg-foreground text-background"
                      : "bg-secondary text-foreground hover:bg-secondary/80",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </ChipScroller>
        </div>

        {/* Row 2: অপরাধ ক্যাটাগরি */}
        <ChipScroller className="pb-2 sm:pb-2.5">
          {CRIME_CATEGORIES.map((c) => {
            const on = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => patchParam("category", c.key)}
                className={cn(
                  "h-7 shrink-0 rounded-lg px-2.5 text-[12px] font-medium whitespace-nowrap transition sm:h-8 sm:px-3 sm:text-[13px]",
                  on
                    ? "bg-foreground text-background"
                    : "bg-secondary text-foreground hover:bg-secondary/80",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </ChipScroller>
      </div>

      <div className="w-full min-w-0 px-2.5 pb-28 pt-3 sm:px-4 sm:pb-24 sm:pt-4">
        {query.trim() ? (
          <p className="mb-3 text-sm text-muted-foreground sm:mb-4">
            সার্চ ফলাফল:{" "}
            <span className="font-semibold text-foreground">
              “{query.trim()}”
            </span>
          </p>
        ) : null}
        <div className="grid w-full grid-cols-1 gap-x-3 gap-y-5 min-[480px]:grid-cols-2 sm:gap-y-7 md:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] sm:gap-x-4 sm:gap-y-8">
          {shown.map((c, i) => (
            <VideoCard key={c.id} c={c} index={i} />
          ))}
        </div>

        {shown.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <p className="text-lg font-semibold">কোনো ভিডিও নেই</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {query.trim()
                ? `"${query.trim()}" এর সাথে মিলে এমন কেস নেই।`
                : activeDistrict
                  ? `${activeDistrict} এ এখনো কেস নেই — সব জেলা দেখতে × চাপুন।`
                  : "স্মার্ট সার্চ বা অন্য ফিল্টার চেষ্টা করুন।"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
