"use client";

import { ExternalLink, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { resolveMediaUrl } from "@/lib/studio";
import { resolveCaseThumbnail } from "@/lib/thumbnails";
import { cn } from "@/lib/utils";

function youtubeSrc(id: string) {
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
}

function facebookSrc(id: string, originalUrl?: string) {
  const href =
    (originalUrl || "").trim() ||
    `https://www.facebook.com/watch/?v=${id}`;
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false&width=800`;
}

function openUrl(provider?: string, id?: string, url?: string) {
  if (url?.trim()) return url.trim();
  if (provider === "youtube" && id)
    return `https://www.youtube.com/watch?v=${id}`;
  if (provider === "facebook" && id)
    return `https://www.facebook.com/watch/?v=${id}`;
  return "";
}

/** Reliable YT / FB iframe player with open-in-tab fallback. */
export function VideoEmbed({
  title,
  provider,
  embedId,
  mediaUrl,
  thumbnailUrl,
  className,
}: {
  title: string;
  provider?: string;
  embedId?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const kind = (provider || "").toLowerCase();
  const id = (embedId || "").trim();
  const poster = resolveCaseThumbnail({
    thumbnail_url: thumbnailUrl,
    media_provider: kind,
    media_embed_id: id,
  });

  // Direct upload (S3 / নিজস্ব স্টোরেজ) — native HTML5 player
  if (kind === "upload" || kind === "mirror") {
    const src = resolveMediaUrl(mediaUrl);
    if (src) {
      return (
        <div
          className={cn(
            "relative aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-black/5",
            className,
          )}
        >
          <video
            title={title}
            className="absolute inset-0 h-full w-full"
            src={src}
            poster={poster || undefined}
            controls
            playsInline
            preload="metadata"
            controlsList="nodownload"
          />
        </div>
      );
    }
  }

  const canEmbed =
    !failed &&
    !!id &&
    (kind === "youtube" || kind === "facebook");

  const src = useMemo(() => {
    if (!canEmbed) return "";
    if (kind === "youtube") return youtubeSrc(id);
    return facebookSrc(id, mediaUrl);
  }, [canEmbed, kind, id, mediaUrl]);

  const external = openUrl(kind, id, mediaUrl);

  if (!canEmbed) {
    return (
      <div
        className={cn(
          "relative flex aspect-video flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-player text-center ring-1 ring-black/5",
          className,
        )}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <Play className="ml-0.5 h-6 w-6 fill-current" />
        </span>
        <p className="px-4 text-sm text-white/80">
          {id ? "এম্বেড লোড হয়নি" : "ভিডিও এম্বেড নেই"}
        </p>
        {external ? (
          <a
            href={external}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25"
          >
            নতুন ট্যাবে খুলুন <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-black/5",
        className,
      )}
    >
      <iframe
        title={title}
        className="absolute inset-0 h-full w-full border-0"
        src={src}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onError={() => setFailed(true)}
      />
      {external ? (
        <a
          href={external}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] text-white hover:bg-black/85"
        >
          মূল সূত্র <ExternalLink className="h-3 w-3" />
        </a>
      ) : null}
    </div>
  );
}
