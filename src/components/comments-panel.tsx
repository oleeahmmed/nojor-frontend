"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquareText } from "lucide-react";
import {
  fetchComments,
  formatCount,
  postComment,
  type CommentItem,
} from "@/lib/engagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useIdentity } from "./identity-provider";

type Props = {
  slug: string;
  active: boolean;
  totalHint: number;
  onTotalChange?: (n: number) => void;
};

export function CommentsPanel({
  slug,
  active,
  totalHint,
  onTotalChange,
}: Props) {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(totalHint);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const { name, requireName } = useIdentity();

  const loadFirst = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await fetchComments(slug, { limit: 20 });
      setItems(page.items);
      setCursor(page.next_cursor);
      setTotal(page.total);
      onTotalChange?.(page.total);
      setLoaded(true);
    } catch {
      setError("মন্তব্য লোড হয়নি।");
    } finally {
      setLoading(false);
    }
  }, [slug, onTotalChange]);

  useEffect(() => {
    setItems([]);
    setCursor(null);
    setLoaded(false);
    setError("");
    setBody("");
  }, [slug]);

  useEffect(() => {
    if (active && !loaded && !loading) void loadFirst();
  }, [active, loaded, loading, loadFirst]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchComments(slug, { cursor, limit: 20 });
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.next_cursor);
      setTotal(page.total);
      onTotalChange?.(page.total);
    } finally {
      setLoadingMore(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim() || posting) return;
    const named = await requireName();
    if (!named) return;
    setPosting(true);
    try {
      const r = await postComment(slug, body.trim(), named);
      if (r?.ok && r.comment) {
        setItems((prev) => [r.comment as CommentItem, ...prev]);
        setBody("");
        if (typeof r.comment_count === "number") {
          setTotal(r.comment_count);
          onTotalChange?.(r.comment_count);
        }
      } else setError(r?.error || "পোস্ট ব্যর্থ।");
    } catch {
      setError("পোস্ট ব্যর্থ।");
    } finally {
      setPosting(false);
    }
  }

  if (!active) {
    return (
      <Button
        type="button"
        variant="secondary"
        className="mt-4 h-12 w-full rounded-xl"
        onClick={() => void loadFirst()}
      >
        <MessageSquareText className="h-4 w-4" />
        {formatCount(totalHint)} comments দেখুন
      </Button>
    );
  }

  return (
    <section className="mt-6">
      <h2 className="mb-4 text-base font-bold tracking-tight">
        {formatCount(total)} মন্তব্য
      </h2>

      <form onSubmit={onSubmit} className="mb-6 flex gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
            {(name || "আ").slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={name ? `${name} হিসেবে মন্তব্য…` : "মন্তব্য লিখুন…"}
            className="rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0"
            maxLength={2000}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setBody("")}
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-full"
              disabled={posting || body.trim().length < 2}
            >
              {posting ? "…" : "পোস্ট"}
            </Button>
          </div>
        </div>
      </form>

      {loading && (
        <div className="space-y-4 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}

      <ul className="space-y-5">
        {items.map((c) => (
          <li key={c.id} className="flex gap-3">
            <Avatar size="sm">
              <AvatarFallback className="bg-muted text-[11px] font-bold">
                {(c.author_name || "A").slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[13px]">
                <span className="font-semibold">{c.author_name}</span>
                <span className="ml-2 text-muted-foreground">
                  {formatRelative(c.created_at)}
                </span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                {c.body}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {!loading && items.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">এখনো কোনো মন্তব্য নেই।</p>
      ) : null}

      {cursor ? (
        <Button
          type="button"
          variant="secondary"
          className="mt-4 w-full rounded-full"
          disabled={loadingMore}
          onClick={() => void loadMore()}
        >
          {loadingMore ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> আরো লোড…
            </span>
          ) : (
            "আরও মন্তব্য"
          )}
        </Button>
      ) : null}
    </section>
  );
}

function formatRelative(iso: string) {
  try {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString("bn-BD");
  } catch {
    return "";
  }
}
