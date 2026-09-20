"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { ArchiveCase } from "@/lib/types";
import { WatchCasePanel } from "@/components/watch-case-panel";
import { EngagementBar } from "@/components/engagement-bar";
import { CommentsPanel } from "@/components/comments-panel";
import { VerdictPanel } from "@/components/verdict-panel";
import { VideoEmbed } from "@/components/video-embed";
import { formatCount } from "@/lib/engagement";
import { RelatedThumb } from "./related-thumb";
import { partyLabel } from "@/lib/parties";
import { CaseHashtags } from "@/components/case-hashtags";
import {
  PublisherAvatar,
  publisherLabel,
} from "@/components/publisher-avatar";

/**
 * Title row holds Case ID + staff actions (no extra row above tabs).
 */
export function WatchView({
  c,
  related,
}: {
  c: ArchiveCase;
  related: ArchiveCase[];
}) {
  const [commentsOpen, setCommentsOpen] = useState(true);
  const [commentCount, setCommentCount] = useState(c.comment_count);
  const [views, setViews] = useState(c.view_count);
  const [status, setStatus] = useState(c.status);
  const [caseData, setCaseData] = useState(c);
  const [titleChrome, setTitleChrome] = useState<ReactNode>(null);

  const onChrome = useCallback((node: ReactNode | null) => {
    setTitleChrome(node);
  }, []);

  useEffect(() => {
    setCommentCount(c.comment_count);
    setViews(c.view_count);
    setCommentsOpen(true);
    setStatus(c.status);
    setCaseData(c);
  }, [c.slug, c.comment_count, c.view_count, c.status, c]);

  const next = related.filter((r) => r.id !== c.id).slice(0, 16);

  return (
    <div className="w-full pb-10 pt-0 sm:pt-4">
      <div className="grid w-full grid-cols-1 gap-0 px-0 lg:grid-cols-[minmax(0,1fr)_402px] lg:gap-x-4 lg:px-4 xl:gap-x-6 xl:px-6">
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
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
              <h1 className="min-w-0 flex-1 text-[18px] font-bold leading-snug tracking-[-0.02em] sm:text-[20px]">
                {caseData.title}
              </h1>
              {titleChrome}
            </div>
            <CaseHashtags tags={caseData.tags} className="mt-1.5" />

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <PublisherAvatar
                  author={caseData.author}
                  district={caseData.district}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {publisherLabel(caseData.author, caseData.district)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCount(views)} views
                    {partyLabel(caseData.accused_party)
                      ? ` · ${partyLabel(caseData.accused_party)}`
                      : ""}
                  </p>
                </div>
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

            <WatchCasePanel
              key={`panel-${caseData.slug}`}
              c={caseData}
              views={views}
              onChrome={onChrome}
              onUpdated={(patch) => {
                setCaseData((prev) => ({ ...prev, ...patch }));
                if (patch.status) setStatus(patch.status);
              }}
            />

            <CommentsPanel
              key={`comments-${c.slug}`}
              slug={c.slug}
              active={commentsOpen}
              totalHint={commentCount}
              onTotalChange={setCommentCount}
            />
          </div>
        </div>

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
