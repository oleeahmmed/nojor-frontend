"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  EllipsisVertical,
  Link2,
  MessageSquareText,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import {
  fetchMyEngagement,
  formatCount,
  reactToCase,
  recordView,
  shareCase,
} from "@/lib/engagement";
import { useIdentity } from "./identity-provider";
import { ShareSheet } from "./share-sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  title?: string;
  initialViews: number;
  initialLikes: number;
  initialDislikes: number;
  initialShares: number;
  onCommentClick: () => void;
  commentCount: number;
  onViews?: (n: number) => void;
};

export function EngagementBar({
  slug,
  title,
  initialViews,
  initialLikes,
  initialDislikes,
  initialShares,
  onCommentClick,
  commentCount,
  onViews,
}: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [shares, setShares] = useState(initialShares);
  const [mine, setMine] = useState<"like" | "dislike" | null>(null);
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [alreadyShared, setAlreadyShared] = useState(false);
  const viewed = useRef(false);
  const sharing = useRef(false);
  const { requireName } = useIdentity();

  useEffect(() => {
    viewed.current = false;
    setLikes(initialLikes);
    setDislikes(initialDislikes);
    setShares(initialShares);
    setMine(null);
    setAlreadyShared(false);
    setShareOpen(false);
  }, [slug, initialLikes, initialDislikes, initialShares]);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    const t = window.setTimeout(() => {
      recordView(slug)
        .then((r) => {
          if (typeof r?.view_count === "number") onViews?.(r.view_count);
        })
        .catch(() => {});
    }, 800);
    return () => window.clearTimeout(t);
  }, [slug, onViews]);

  useEffect(() => {
    let alive = true;
    fetchMyEngagement(slug)
      .then((r) => {
        if (!alive || !r?.ok) return;
        if (typeof r.like_count === "number") setLikes(r.like_count);
        if (typeof r.dislike_count === "number") setDislikes(r.dislike_count);
        if (typeof r.share_count === "number") setShares(r.share_count);
        setMine(r.my_reaction ?? null);
        setAlreadyShared(!!r.shared);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [slug]);

  const onReact = useCallback(
    async (action: "like" | "dislike") => {
      if (busy) return;
      const named = await requireName();
      if (!named) return;
      setBusy(true);
      const next = mine === action ? "none" : action;
      try {
        const r = await reactToCase(slug, next);
        if (r?.ok) {
          setLikes(r.like_count ?? likes);
          setDislikes(r.dislike_count ?? dislikes);
          setMine(r.my_reaction ?? null);
        }
      } catch {
        /* ignore */
      } finally {
        setBusy(false);
      }
    },
    [busy, mine, slug, likes, dislikes, requireName],
  );

  const countShareOnce = useCallback(async () => {
    if (alreadyShared || sharing.current) return;
    sharing.current = true;
    try {
      const r = await shareCase(slug);
      if (typeof r?.share_count === "number") setShares(r.share_count);
      if (r?.shared || r?.counted) setAlreadyShared(true);
    } catch {
      /* ignore */
    } finally {
      sharing.current = false;
    }
  }, [alreadyShared, slug]);

  async function copyFromMenu() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      await countShareOnce();
    } catch {
      /* ignore */
    }
  }

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const pageTitle =
    title || (typeof document !== "undefined" ? document.title : "নজর");

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div className="flex overflow-hidden rounded-full bg-secondary">
        <button
          type="button"
          disabled={busy}
          onClick={() => onReact("like")}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 px-3.5 text-sm font-medium hover:bg-foreground/5",
            mine === "like" && "text-foreground",
          )}
        >
          <ThumbsUp
            className="h-4 w-4"
            fill={mine === "like" ? "currentColor" : "none"}
          />
          {formatCount(likes)}
        </button>
        <span className="w-px self-stretch bg-border/80" />
        <button
          type="button"
          disabled={busy}
          onClick={() => onReact("dislike")}
          aria-label="Dislike"
          className={cn(
            "inline-flex h-9 items-center px-3 hover:bg-foreground/5",
            mine === "dislike" && "text-foreground",
          )}
        >
          <ThumbsDown
            className="h-4 w-4"
            fill={mine === "dislike" ? "currentColor" : "none"}
          />
          {dislikes > 0 ? (
            <span className="ml-1 text-sm">{formatCount(dislikes)}</span>
          ) : null}
        </button>
      </div>

      <button
        type="button"
        onClick={onCommentClick}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-secondary px-3.5 text-sm font-medium hover:bg-secondary/80"
      >
        <MessageSquareText className="h-4 w-4" />
        {formatCount(commentCount)}
      </button>

      <button
        type="button"
        onClick={() => setShareOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-secondary px-3.5 text-sm font-medium hover:bg-secondary/80"
      >
        <Share2 className="h-4 w-4" />
        Share
        {shares > 0 ? (
          <span className="text-muted-foreground">{formatCount(shares)}</span>
        ) : null}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex size-9 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80"
          aria-label="More"
        >
          <EllipsisVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onClick={() => void copyFromMenu()}>
            <Link2 className="h-4 w-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShareOpen(true)}>
            <Share2 className="h-4 w-4" />
            Share
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShareSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        title={pageTitle}
        url={pageUrl}
        onShared={() => void countShareOnce()}
      />
    </div>
  );
}
