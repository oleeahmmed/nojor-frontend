"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Play } from "lucide-react";
import type { ArchiveCase } from "@/lib/types";
import { StatusChip } from "./status-chip";
import { formatCount } from "@/lib/engagement";
import { categoryLabel } from "@/lib/categories";
import { CaseHashtags } from "./case-hashtags";
import { resolveCaseThumbnail, youtubeThumbUrl } from "@/lib/thumbnails";
import {
  PublisherAvatar,
  publisherLabel,
} from "@/components/publisher-avatar";

const THUMB_TONES = [
  "linear-gradient(145deg,#2b2b2b 0%,#111 55%,#3a3a3a 100%)",
  "linear-gradient(145deg,#1a2332 0%,#0d1520 55%,#243447 100%)",
  "linear-gradient(145deg,#2a1f1a 0%,#140e0c 55%,#4a3020 100%)",
  "linear-gradient(145deg,#1a2a1f 0%,#0c140e 55%,#2a4a30 100%)",
  "linear-gradient(145deg,#241a2a 0%,#120c16 55%,#3a2a4a 100%)",
  "linear-gradient(145deg,#1a242a 0%,#0c1216 55%,#2a3a4a 100%)",
];

export function VideoCard({ c, index = 0 }: { c: ArchiveCase; index?: number }) {
  const tone = THUMB_TONES[index % THUMB_TONES.length];
  const primary = resolveCaseThumbnail(c);
  const fallbackYt =
    (c.media_provider || "").toLowerCase() === "youtube"
      ? youtubeThumbUrl(c.media_embed_id, "mqdefault")
      : "";
  const [src, setSrc] = useState(primary);
  const [failed, setFailed] = useState(!primary);

  return (
    <Link
      href={`/cases/${c.slug}`}
      className="group flex w-full min-w-0 flex-col active:opacity-90"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-player ring-1 ring-black/5 sm:rounded-xl">
        {failed || !src ? (
          <div className="absolute inset-0" style={{ background: tone }} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
            onError={() => {
              if (fallbackYt && src !== fallbackYt) {
                setSrc(fallbackYt);
                return;
              }
              setFailed(true);
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80" />

        <div className="absolute inset-0 hidden items-center justify-center opacity-0 transition duration-200 group-hover:opacity-100 sm:flex">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </div>

        <div className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2">
          <StatusChip status={c.status} />
        </div>
        {c.dur && c.dur !== "—" ? (
          <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white sm:bottom-2 sm:right-2 sm:text-[11px]">
            {c.dur}
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 flex gap-2.5 sm:mt-3 sm:gap-3">
        <PublisherAvatar
          author={c.author}
          district={c.district}
          className="size-8 sm:size-9"
        />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 min-h-[2.4em] text-[14px] font-medium leading-snug tracking-[-0.01em] text-foreground sm:min-h-[2.5em] sm:text-[15px]">
            {c.title}
          </h3>
          <p className="mt-0.5 truncate text-[12px] text-muted-foreground sm:mt-1 sm:text-[13px]">
            <span>{publisherLabel(c.author, c.district)}</span>
            {c.case_id ? (
              <>
                <span> · </span>
                <span className="font-medium text-foreground/70">
                  {c.case_id}
                </span>
              </>
            ) : null}
            {c.crime_category ? (
              <>
                <span> · </span>
                <span>{categoryLabel(c.crime_category)}</span>
              </>
            ) : null}
            {c.official ? (
              <BadgeCheck className="ml-1 inline h-3.5 w-3.5 align-text-bottom text-primary" />
            ) : null}
          </p>
          <p className="truncate text-[12px] text-muted-foreground sm:text-[13px]">
            {c.view_count > 0
              ? `${formatCount(c.view_count)} views`
              : c.views || "0 views"}
            {" · "}
            {c.date && c.date !== "—" ? c.date : "সম্প্রতি"}
          </p>
          {c.tags && c.tags.length > 0 ? (
            <CaseHashtags
              tags={c.tags.slice(0, 3)}
              className="mt-1"
              linkSearch={false}
            />
          ) : null}
        </div>
      </div>
    </Link>
  );
}
