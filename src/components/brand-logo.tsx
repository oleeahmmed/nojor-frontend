import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import { cn } from "@/lib/utils";

/** PNG / FAB fallback */
export const BRAND_MARK = "/brand/nojor-mark.png";
export const BRAND_MARK_SVG = "/brand/nojor-mark.svg";
/** তদন্ত / official variant */
export const BRAND_MARK_TODONTO = "/brand/nojor-mark-todonto.png";

/**
 * Circular mark — green background, red eye center (larger for header).
 */
export function NojorMarkSvg({
  className,
  title = "নজর",
}: {
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const redId = `nojRed-${uid}`;
  const greenId = `nojGreen-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 80"
      className={cn("shrink-0", className)}
      role="img"
      aria-hidden={!title || undefined}
      aria-label={title || undefined}
    >
      <defs>
        <radialGradient id={greenId} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>
        <radialGradient id={redId} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="100%" stopColor="#cc0000" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill={`url(#${greenId})`} />
      <circle cx="40" cy="40" r="26" fill={`url(#${redId})`} />
      <ellipse
        cx="40"
        cy="40"
        rx="16"
        ry="10"
        fill="#fff"
        stroke="#064e3b"
        strokeWidth="1.8"
      />
      <circle cx="40" cy="40" r="6.5" fill="#065f46" />
      <circle cx="40" cy="40" r="3.2" fill="#0b0b0b" />
      <circle cx="38.2" cy="38.2" r="1.1" fill="#fff" opacity="0.9" />
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

/** Larger mark + wordmark stretching right. */
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
        "group flex min-w-0 items-center gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-2.5",
        className,
      )}
      aria-label="নজর — হোমে যান"
    >
      <NojorMarkSvg
        className={cn(
          "size-9 shadow-sm transition-transform duration-200 ease-out group-hover:scale-[1.04] sm:size-10",
          compact && "size-8 sm:size-9",
        )}
      />
      <span
        className={cn(
          "truncate font-[family-name:var(--font-noto-bn)] text-[1.35rem] font-bold leading-none tracking-tight text-foreground sm:text-[1.55rem]",
          compact && "text-[1.2rem] sm:text-[1.4rem]",
        )}
      >
        নজর
      </span>
    </Link>
  );
}
