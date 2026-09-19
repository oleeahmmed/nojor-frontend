import { resolveMediaUrl } from "./studio";

/** YouTube CDN poster from 11-char video id. */
export function youtubeThumbUrl(
  embedId?: string,
  quality: "hqdefault" | "mqdefault" | "sddefault" | "maxresdefault" = "hqdefault",
): string {
  const id = (embedId || "").trim();
  if (!id || id.length < 11) return "";
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}

/**
 * Best poster for a case/card:
 * 1) stored thumbnail_url (custom upload / FB oEmbed)
 * 2) YouTube auto from embed id
 */
export function resolveCaseThumbnail(c: {
  thumbnail_url?: string;
  media_provider?: string;
  media_embed_id?: string;
}): string {
  const stored = resolveMediaUrl(c.thumbnail_url);
  if (stored) return stored;
  const provider = (c.media_provider || "").toLowerCase();
  if (provider === "youtube" || provider === "mirror") {
    return youtubeThumbUrl(c.media_embed_id);
  }
  return "";
}

export function formatDuration(
  seconds?: number | null | string,
  fallback = "0:00",
): string {
  if (seconds == null || seconds === "") return fallback;
  const n = Number(seconds);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  const s = Math.floor(n);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}:${String(m % 60).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }
  return `${m}:${String(r).padStart(2, "0")}`;
}

/** Grab a JPEG frame from a local video File (for auto thumbnail). */
export function captureVideoFrame(
  file: File,
  atSeconds = 1,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
    };

    const fail = () => {
      cleanup();
      resolve(null);
    };

    video.onerror = fail;
    video.onloadeddata = () => {
      const t = Math.min(
        Math.max(0.1, atSeconds),
        Math.max(0.1, (video.duration || 1) * 0.15),
      );
      const onSeeked = () => {
        try {
          const w = video.videoWidth || 640;
          const h = video.videoHeight || 360;
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            fail();
            return;
          }
          ctx.drawImage(video, 0, 0, w, h);
          canvas.toBlob(
            (blob) => {
              cleanup();
              resolve(blob);
            },
            "image/jpeg",
            0.86,
          );
        } catch {
          fail();
        }
      };
      video.onseeked = onSeeked;
      try {
        video.currentTime = t;
      } catch {
        fail();
      }
    };
  });
}
