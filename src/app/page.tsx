import { Suspense } from "react";
import { fetchCases } from "@/lib/api";
import type { ArchiveCase } from "@/lib/types";
import { YtShell } from "@/components/yt-shell";
import { HomeFeed } from "@/components/home-feed";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    q?: string;
    from?: string;
    to?: string;
    division?: string;
    district?: string;
    upazila?: string;
    category?: string;
    status?: string;
    sort?: string;
  }>;
}) {
  const sp = await searchParams;
  const view = sp.view || "home";
  let cases: ArchiveCase[] = [];
  try {
    const sort =
      sp.sort === "new" || sp.sort === "viral"
        ? sp.sort
        : view === "viral"
          ? "viral"
          : "rank";
    cases = await fetchCases({
      q: sp.q,
      date_from: sp.from,
      date_to: sp.to,
      division: sp.division,
      district: sp.district,
      upazila: sp.upazila,
      category: sp.category && sp.category !== "all" ? sp.category : undefined,
      status: sp.status && sp.status !== "all" ? sp.status : undefined,
      sort,
    });
  } catch {
    cases = [];
  }

  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading…</div>}>
      <YtShell>
        <HomeFeed cases={cases} view={view} query={sp.q || ""} />
      </YtShell>
    </Suspense>
  );
}
