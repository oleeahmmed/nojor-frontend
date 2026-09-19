import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Circular mark only (no green square) */
export const BRAND_MARK = "/brand/nojor-mark.svg";
export const BRAND_MARK_PNG = "/brand/nojor-mark.png";
/** তদন্ত / official variant */
export const BRAND_MARK_TODONTO = "/brand/nojor-mark-todonto.png";

export function BrandMark({
  variant = "default",
  size = 48,
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
    <img
      src={BRAND_MARK}
      alt={alt}
      width={size}
      height={size}
      className={cn(
        "shrink-0 bg-transparent object-contain drop-shadow-sm",
        className,
      )}
      decoding="async"
    />
  );
}

/**
 * নজর — লাল বৃত্ত লোগো (গ্রিন স্কোয়ার / অ্যানিমেশন নেই)।
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
        "group flex items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label="নজর — হোমে যান"
    >
      <BrandMark
        size={compact ? 40 : 52}
        className={cn(
          "!size-10 transition-transform duration-200 ease-out group-hover:scale-[1.04] sm:!size-12",
          !compact && "md:!size-[3.25rem]",
        )}
      />
    </Link>
  );
}
