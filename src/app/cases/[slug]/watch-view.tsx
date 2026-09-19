"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Clock, ExternalLink, FileText } from "lucide-react";
import type { ArchiveCase } from "@/lib/types";
import type { LegalStatusKey } from "@/lib/types";
import { StatusChip } from "@/components/status-chip";
import { useApp } from "@/components/providers";
import { OfficialStatusPanel } from "@/components/official-status-panel";
import { StaffEditPanel } from "@/components/staff-edit-panel";
import { EngagementBar } from "@/components/engagement-bar";
import { CommentsPanel } from "@/components/comments-panel";
import { VerdictPanel } from "@/components/verdict-panel";
import { VideoEmbed } from "@/components/video-embed";
import { formatCount } from "@/lib/engagement";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { RelatedThumb } from "./related-thumb";
import { useStudioSession } from "@/hooks/use-studio-session";

/**
 * YouTube watch layout:
 * - No left mini-rail (handled by YtShell collapseSidebar)
 * - Primary column + fixed 402px related column
 * - Tight 24px gutters; player top-aligned with related list
 * Ref: https://www.youtube.com/watch?v=YxJjFjP0crs
 */
export function WatchView({
  c,
  related,
}: {
  c: ArchiveCase;
  related: ArchiveCase[];
}) {
  const { role } = useApp();
  const studioOk = useStudioSession();
  const [commentsOpen, setCommentsOpen] = useState(true);
  const [commentCount, setCommentCount] = useState(c.comment_count);
  const [views, setViews] = useState(c.view_count);
  const [descOpen, setDescOpen] = useState(false);
  const [status, setStatus] = useState(c.status);
  const [caseData, setCaseData] = useState(c);

  useEffect(() => {
    setCommentCount(c.comment_count);
    setViews(c.view_count);
    setCommentsOpen(true);
    setDescOpen(false);
    setStatus(c.status);
    setCaseData(c);
  }, [c.slug, c.comment_count, c.view_count, c.status, c]);

  const next = related.filter((r) => r.id !== c.id).slice(0, 16);

  return (
    <div className="w-full pb-10 pt-0 sm:pt-4">
      {/*
        YouTube watch: ~16–24px from left edge (align with header chrome),
        no centered max-width that creates a big left void.
      */}
      <div className="grid w-full grid-cols-1 gap-0 px-0 lg:grid-cols-[minmax(0,1fr)_402px] lg:gap-x-4 lg:px-4 xl:gap-x-6 xl:px-6">
        {/* Primary — player + meta */}
        <div className="min-w-0">
          <VideoEmbed
            key={c.slug}
            title={c.title}
            provider={c.media_provider}
            embedId={c.media_embed_id}
            mediaUrl={c.media_url}
            thumbnailUrl={c.thumbnail_url}
            className="rounded-none sm:rounded-xl"
          />

          <div className="px-3 sm:px-0">
            <h1 className="mt-3 text-[18px] font-bold leading-snug tracking-[-0.02em] sm:text-[20px]">
              {caseData.title}
            </h1>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                    {(caseData.district || "N").slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {caseData.district} Archive
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCount(views)} views
                  </p>
                </div>
                <StatusChip status={status} />
              </div>
              <EngagementBar
                slug={c.slug}
                title={caseData.title}
                initialViews={c.view_count}
                initialLikes={c.like_count}
                initialDislikes={c.dislike_count}
                initialShares={c.share_count}
                commentCount={commentCount}
                onCommentClick={() => setCommentsOpen(true)}
                onViews={setViews}
              />
            </div>

            <VerdictPanel key={`verdict-${c.slug}-${status}`} c={caseData} />

            <StaffEditPanel
              caseData={caseData}
              onUpdated={(patch) => {
                setCaseData((prev) => ({ ...prev, ...patch }));
                if (patch.status) setStatus(patch.status);
              }}
            />

            {role === "official" && !studioOk && (
              <OfficialStatusPanel
                slug={c.slug}
                district={caseData.district}
                currentStatus={status}
                onUpdated={(next: LegalStatusKey, verdictSummary?: string) => {
                  setStatus(next);
                  setCaseData((prev) => ({
                    ...prev,
                    status: next,
                    has_verdict: ["convicted", "acquitted", "dismissed"].includes(
                      next,
                    ),
                    verdict_summary: verdictSummary || prev.verdict_summary,
                  }));
                }}
              />
            )}

            <button
              type="button"
              onClick={() => setDescOpen((v) => !v)}
              className="mt-3 w-full rounded-xl bg-secondary/80 px-3.5 py-3 text-left transition hover:bg-secondary"
            >
              <p className="text-[13px] font-semibold">
                {formatCount(views)} views · {c.date}
              </p>
              <p
                className={cn(
                  "mt-1.5 text-sm leading-relaxed text-foreground/90",
                  !descOpen && "line-clamp-2",
                )}
              >
                {c.summary}
              </p>
              <span className="mt-1 inline-flex items-center gap-0.5 text-[12px] font-semibold text-muted-foreground">
                {descOpen ? "কম দেখুন" : "আরও দেখুন"}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition",
                    descOpen && "rotate-180",
                  )}
                />
              </span>

              {descOpen ? (
                <div className="mt-3 space-y-3 border-t border-border/50 pt-3">
                  <div>
                    <p className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold">
                      <FileText className="h-3.5 w-3.5" /> সূত্র
                    </p>
                    {c.sources.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        সূত্র যোগ হয়নি
                      </p>
                    ) : (
                      c.sources.map((s, i) => {
                        const href = s.url?.trim();
                        const inner = (
                          <>
                            <span className="min-w-0">
                              {s.t}{" "}
                              <span className="text-muted-foreground">
                                · {s.p}
                              </span>
                            </span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </>
                        );
                        return href ? (
                          <a
                            key={i}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 rounded-lg py-1 text-sm hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {inner}
                          </a>
                        ) : (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-2 py-1 text-sm text-muted-foreground"
                          >
                            {inner}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-[13px] font-semibold">
                      আইনি অবস্থা
                    </p>
                    <div className="space-y-1.5">
                      {c.timeline.map((tl, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span
                            className={cn(
                              "mt-1.5 h-2 w-2 rounded-full",
                              tl.done ? "bg-foreground" : "bg-border",
                            )}
                          />
                          <div>
                            <p
                              className={
                                tl.done
                                  ? "font-medium"
                                  : "text-muted-foreground"
                              }
                            >
                              {tl.s}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" /> {tl.d}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </button>

            <CommentsPanel
              key={`comments-${c.slug}`}
              slug={c.slug}
              active={commentsOpen}
              totalHint={commentCount}
              onTotalChange={setCommentCount}
            />
          </div>
        </div>

        {/* Secondary — related (YouTube 402px column) */}
        <aside className="mt-4 min-w-0 px-3 sm:px-0 lg:mt-0 lg:sticky lg:top-0 lg:self-start">
          <div className="space-y-1.5">
            {next.map((r) => (
              <Link
                key={r.id}
                href={`/cases/${r.slug}`}
                className="flex gap-2 rounded-xl p-0 transition-colors hover:bg-muted/50 sm:gap-2"
              >
                <RelatedThumb c={r} />
                <div className="min-w-0 flex-1 py-0.5 pr-1">
                  <p className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground sm:text-sm">
                    {r.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.district}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCount(r.view_count)} views
                    {r.date && r.date !== "—" ? ` · ${r.date}` : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
