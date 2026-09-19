import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** PNG fallback / FAB */
export const BRAND_MARK = "/brand/nojor-mark.png";
export const BRAND_MARK_SVG = "/brand/nojor-mark.svg";
/** তদন্ত / official variant */
export const BRAND_MARK_TODONTO = "/brand/nojor-mark-todonto.png";

/** Red-only circular mark — inline so encoding / path never breaks. */
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
      viewBox="0 0 200 200"
      className={cn("shrink-0 bg-transparent", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <radialGradient id="nojRed" cx="42%" cy="36%" r="68%">
          <stop offset="0%" stopColor="#ff5a52" />
          <stop offset="55%" stopColor="#e11d2e" />
          <stop offset="100%" stopColor="#b01020" />
        </radialGradient>
        <radialGradient id="nojIris" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#0a7a55" />
          <stop offset="100%" stopColor="#004d36" />
        </radialGradient>
        <linearGradient id="nojRoad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd24a" />
          <stop offset="100%" stopColor="#e11d2e" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="92" fill="url(#nojRed)" />

      <ellipse
        cx="100"
        cy="78"
        rx="46"
        ry="28"
        fill="#f7f8f2"
        stroke="#00563a"
        strokeWidth="5"
      />
      <circle
        cx="100"
        cy="78"
        r="20"
        fill="url(#nojIris)"
        stroke="#003d2a"
        strokeWidth="1.5"
      />
      <circle
        cx="100"
        cy="78"
        r="13"
        fill="none"
        stroke="#003d2a"
        strokeWidth="1"
        opacity="0.3"
      />
      <circle cx="100" cy="78" r="9" fill="#0b0b0b" />
      <circle cx="95" cy="73" r="2.2" fill="#fff" opacity="0.85" />
      <text
        x="100"
        y="82"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#ffd24a"
        fontFamily="Noto Sans Bengali, Hind Siliguri, sans-serif"
      >
        {"৩য়"}
      </text>

      <path
        d="M138 62c8-6 14-8 18-8"
        fill="none"
        stroke="#00563a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M140 72c9-2 15-2 20-1"
        fill="none"
        stroke="#00563a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M136 92c8 5 14 8 19 9"
        fill="none"
        stroke="#00563a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      <path d="M92 108 L108 108 L112 128 L88 128 Z" fill="url(#nojRoad)" />
      <circle cx="100" cy="112" r="1.6" fill="#ffe9a0" />
      <circle cx="100" cy="117" r="1.6" fill="#ffe9a0" />
      <circle cx="100" cy="122" r="1.6" fill="#ffe9a0" />

      <text
        x="100"
        y="162"
        textAnchor="middle"
        fontSize="36"
        fontWeight="800"
        fill="#00563a"
        stroke="#e8ece9"
        strokeWidth="1.2"
        paintOrder="stroke fill"
        fontFamily="Noto Sans Bengali, Hind Siliguri, Vrinda, sans-serif"
      >
        নজর
      </text>
    </svg>
  );
}

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
    <NojorMarkSvg
      title={alt}
      className={cn("drop-shadow-sm", className)}
    />
  );
}

/**
 * নজর — লাল বৃত্ত লোগো (ইনলাইন SVG, গ্রিন স্কোয়ার নেই)।
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
      <NojorMarkSvg
        className={cn(
          "size-10 transition-transform duration-200 ease-out group-hover:scale-[1.04] sm:size-12",
          !compact && "md:size-[3.25rem]",
        )}
      />
    </Link>
  );
}
