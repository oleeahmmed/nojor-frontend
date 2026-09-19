import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const BRAND_MARK = "/brand/nojor-mark.png";
/** তদন্ত / official variant */
export const BRAND_MARK_TODONTO = "/brand/nojor-mark-todonto.png";

export function BrandMark({
  variant = "default",
  size = 32,
  className,
  alt = "নজর",
}: {
  variant?: "default" | "todonto";
  size?: number;
  className?: string;
  alt?: string;
}) {
  const src = variant === "todonto" ? BRAND_MARK_TODONTO : BRAND_MARK;
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn(
        "shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-black/10",
        className,
      )}
      priority={size >= 28}
    />
  );
}

/**
 * নজর Tube — লোগো মার্ক + Tube লেবেল।
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
      aria-label="নজর Tube — হোমে যান"
    >
      <BrandMark
        size={36}
        className="!size-8 transition-transform duration-200 group-hover:scale-[1.04] sm:!size-9"
      />
      {!compact && (
        <span className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground md:inline">
          Tube
        </span>
      )}
    </Link>
  );
}
