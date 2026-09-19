import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** PNG / FAB */
export const BRAND_MARK = "/brand/nojor-mark.png";
export const BRAND_MARK_SVG = "/brand/nojor-mark.svg";
/** তদন্ত / official variant */
export const BRAND_MARK_TODONTO = "/brand/nojor-mark-todonto.png";

/**
 * Simple circular mark (eye only) — wordmark sits beside it like YouTube.
 */
export function NojorMarkSvg({
  className,
  title = "নজর",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 80"
      className={cn("shrink-0 bg-transparent", className)}
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <radialGradient id="nojRed" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="100%" stopColor="#cc0000" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill="url(#nojRed)" />
      <ellipse
        cx="40"
        cy="40"
        rx="22"
        ry="14"
        fill="#fff"
        stroke="#0a3d2e"
        strokeWidth="2.5"
      />
      <circle cx="40" cy="40" r="9" fill="#0a5c42" />
      <circle cx="40" cy="40" r="4.5" fill="#0b0b0b" />
      <circle cx="37.5" cy="37.5" r="1.4" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function BrandMark({
  variant = "default",
  size = 36,
  className,
  alt = "নজর",
}: {
  variant?: "default" | "todonto";
  size?: number;
  className?: string;
  alt?: string;
}) {
  if (variant === "todonto") {
    return (
      <Image
        src={BRAND_MARK_TODONTO}
        alt={alt}
        width={size}
        height={size}
        className={cn(
          "shrink-0 rounded-full object-cover ring-1 ring-black/10",
          className,
        )}
        priority={size >= 28}
      />
    );
  }

  return (
    <NojorMarkSvg title={alt} className={cn("drop-shadow-sm", className)} />
  );
}

/**
 * YouTube-style: mark + “নজর” wordmark.
 */
export function BrandLogo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center gap-1.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-2",
        className,
      )}
      aria-label="নজর — হোমে যান"
    >
      <NojorMarkSvg
        className={cn(
          "size-7 transition-transform duration-200 ease-out group-hover:scale-[1.04] sm:size-8",
          compact && "size-7 sm:size-8",
        )}
      />
      <span
        className={cn(
          "font-[family-name:var(--font-noto-bn)] text-[1.15rem] font-bold leading-none tracking-tight text-foreground sm:text-[1.35rem]",
          compact && "text-[1.05rem] sm:text-[1.25rem]",
        )}
      >
        নজর
      </span>
    </Link>
  );
}
