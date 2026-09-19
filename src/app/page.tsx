import { Suspense } from "react";
import { fetchCases } from "@/lib/api";
import type { ArchiveCase } from "@/lib/types";
import { YtShell } from "@/components/yt-shell";
import { HomeFeed } from "@/components/home-feed";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string }>;
}) {
  const sp = await searchParams;
  let cases: ArchiveCase[] = [];
  try {
    cases = await fetchCases();
  } catch {
    cases = [];
  }
  const view = sp.view || "home";

  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading…</div>}>
      <YtShell>
        <HomeFeed cases={cases} view={view} query={sp.q || ""} />
      </YtShell>
    </Suspense>
  );
}
