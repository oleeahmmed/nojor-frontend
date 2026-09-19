import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchCase, fetchCases } from "@/lib/api";
import { YtShell } from "@/components/yt-shell";
import { WatchView } from "./watch-view";

export default async function CasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [c, all] = await Promise.all([fetchCase(slug), fetchCases()]);
  if (!c) notFound();

  return (
    <Suspense fallback={null}>
      <YtShell collapseSidebar>
        <WatchView c={c} related={all} />
      </YtShell>
    </Suspense>
  );
}
