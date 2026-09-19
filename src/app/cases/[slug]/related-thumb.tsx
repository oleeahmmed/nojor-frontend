"use client";

import { useState } from "react";
import type { ArchiveCase } from "@/lib/types";
import { resolveCaseThumbnail, youtubeThumbUrl } from "@/lib/thumbnails";

export function RelatedThumb({ c }: { c: ArchiveCase }) {
  const primary = resolveCaseThumbnail(c);
  const fallbackYt =
    (c.media_provider || "").toLowerCase() === "youtube"
      ? youtubeThumbUrl(c.media_embed_id, "mqdefault")
      : "";
  const [src, setSrc] = useState(primary);
  const [failed, setFailed] = useState(!primary);

  return (
    <div className="relative aspect-video w-[168px] shrink-0 overflow-hidden rounded-lg bg-player">
      {failed || !src ? (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(145deg,#2b2b2b,#111 60%,#444)",
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          onError={() => {
            if (fallbackYt && src !== fallbackYt) {
              setSrc(fallbackYt);
              return;
            }
            setFailed(true);
          }}
        />
      )}
      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] font-medium text-white">
        {c.dur && c.dur !== "—" ? c.dur : "0:00"}
      </span>
    </div>
  );
}
