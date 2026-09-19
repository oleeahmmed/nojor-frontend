"use client";

import { useMemo, useState } from "react";
import { Check, Link2, Mail, Send, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function parseShareTime(raw: string): number {
  const parts = raw
    .trim()
    .split(":")
    .map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 1) return Math.max(0, parts[0]);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

export function withStartAt(url: string, seconds: number): string {
  try {
    const u = new URL(url);
    if (seconds > 0) u.searchParams.set("t", String(seconds));
    else u.searchParams.delete("t");
    return u.toString();
  } catch {
    return url;
  }
}

type Target = {
  id: string;
  label: string;
  bg: string;
  fg: string;
  href?: (url: string, title: string) => string;
  native?: boolean;
  copy?: boolean;
};

const TARGETS: Target[] = [
  {
    id: "copy",
    label: "Copy",
    bg: "bg-secondary",
    fg: "text-foreground",
    copy: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    bg: "bg-[#25D366]",
    fg: "text-white",
    href: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    bg: "bg-[#1877F2]",
    fg: "text-white",
    href: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "x",
    label: "X",
    bg: "bg-black",
    fg: "text-white",
    href: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    bg: "bg-[#229ED9]",
    fg: "text-white",
    href: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "email",
    label: "Email",
    bg: "bg-secondary",
    fg: "text-foreground",
    href: (url, title) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
  {
    id: "more",
    label: "More",
    bg: "bg-secondary",
    fg: "text-foreground",
    native: true,
  },
];

function TargetGlyph({ id }: { id: string }) {
  if (id === "copy") return <Link2 className="h-5 w-5" />;
  if (id === "whatsapp") return <span className="text-lg font-bold">W</span>;
  if (id === "facebook") return <span className="text-lg font-bold">f</span>;
  if (id === "x") return <span className="text-base font-bold">𝕏</span>;
  if (id === "telegram") return <Send className="h-4.5 w-4.5" />;
  if (id === "email") return <Mail className="h-5 w-5" />;
  return <Share2 className="h-5 w-5" />;
}

export function ShareSheet({
  open,
  onOpenChange,
  title,
  url,
  onShared,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
  onShared: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [startAt, setStartAt] = useState(false);
  const [time, setTime] = useState("0:00");

  const shareUrl = useMemo(() => {
    const secs = startAt ? parseShareTime(time) : 0;
    return withStartAt(url, secs);
  }, [url, startAt, time]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      onShared();
    } catch {
      /* ignore */
    }
  }

  async function onTarget(t: Target) {
    if (t.copy) {
      await copyLink();
      return;
    }
    if (t.native) {
      if (navigator.share) {
        try {
          await navigator.share({ title, url: shareUrl });
          onShared();
        } catch {
          /* cancelled */
        }
      } else {
        await copyLink();
      }
      return;
    }
    if (t.href) {
      window.open(t.href(shareUrl, title), "_blank", "noopener,noreferrer");
      onShared();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(85dvh,640px)] flex-col gap-0 overflow-hidden border-0 p-0 sm:max-w-[520px]"
        overlayClassName="bg-black/50"
      >
        <DialogHeader className="shrink-0 border-b border-border/50 px-5 pb-3 pt-4 pr-12">
          <DialogTitle className="text-[18px] font-semibold">Share</DialogTitle>
          <DialogDescription className="sr-only">
            লিংক কপি করুন অথবা অ্যাপে পাঠান
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          <div className="flex gap-4 overflow-x-auto px-5 py-4 [scrollbar-width:thin]">
            {TARGETS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => void onTarget(t)}
                className="flex w-[68px] shrink-0 flex-col items-center gap-2"
              >
                <span
                  className={cn(
                    "flex size-14 items-center justify-center rounded-full",
                    t.bg,
                    t.fg,
                  )}
                >
                  <TargetGlyph id={t.id} />
                </span>
                <span className="text-[12px] text-foreground">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="px-5 pb-2">
            <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/70 py-1 pl-4 pr-1">
              <p className="min-w-0 flex-1 truncate text-[13px]">{shareUrl}</p>
              <Button
                type="button"
                size="sm"
                className="h-8 shrink-0 rounded-full px-4"
                onClick={() => void copyLink()}
              >
                {copied ? (
                  <span className="inline-flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Copied
                  </span>
                ) : (
                  "Copy"
                )}
              </Button>
            </div>
          </div>

          <label className="flex items-center gap-2 px-5 pb-5 pt-3 text-sm">
            <input
              type="checkbox"
              checked={startAt}
              onChange={(e) => setStartAt(e.target.checked)}
              className="size-4 rounded border-border"
            />
            <span>Start at</span>
            <input
              type="text"
              inputMode="numeric"
              value={time}
              disabled={!startAt}
              onChange={(e) => setTime(e.target.value)}
              className="h-8 w-16 rounded-md border border-border bg-background px-2 text-sm disabled:opacity-40"
            />
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
}
