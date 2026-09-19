import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const BRAND_MARK = "/brand/nojor-mark.png";
/** তদন্ত / official variant */
export const BRAND_MARK_TODONTO = "/brand/nojor-mark-todonto.png";

export function BrandMark({
  variant = "default",
  size = 48,
  className,
  alt = "নজর",
  animate = false,
}: {
  variant?: "default" | "todonto";
  size?: number;
  className?: string;
  alt?: string;
  animate?: boolean;
}) {
  const src = variant === "todonto" ? BRAND_MARK_TODONTO : BRAND_MARK;
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn(
        "shrink-0 rounded-xl object-cover shadow-md ring-1 ring-black/10",
        animate && "brand-mark-breathe",
        className,
      )}
      priority={size >= 28}
    />
  );
}

/**
 * নজর — বড় লোগো মার্ক (Tube লেবেল নেই)।
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
        "group flex items-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label="নজর — হোমে যান"
    >
      <BrandMark
        size={compact ? 40 : 52}
        animate
        className={cn(
          "!size-10 shadow-md transition-transform duration-300 ease-out group-hover:scale-[1.06] sm:!size-12",
          !compact && "md:!size-[3.25rem]",
        )}
      />
    </Link>
  );
}
