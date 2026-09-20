"use client";

import { BRAND_MARK } from "@/components/brand-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mediaUrl } from "@/lib/studio";
import type { CaseAuthor } from "@/lib/types";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: "size-6",
  default: "size-8",
  lg: "size-10",
} as const;

export function PublisherAvatar({
  author,
  district,
  className,
  size = "default",
}: {
  author?: CaseAuthor | null;
  district?: string;
  className?: string;
  size?: "default" | "sm" | "lg";
}) {
  const name = author?.name?.trim() || "";
  const remote = mediaUrl(author?.avatar_url);
  const src = remote || BRAND_MARK;
  const letter = (name || district || "ন").slice(0, 1);
  const useBrand = !remote;

  return (
    <Avatar
      size={size}
      className={cn("shrink-0 overflow-hidden", SIZE[size], className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <AvatarImage
        src={src}
        alt={name || "নজর"}
        className={cn(useBrand && "object-cover p-0")}
      />
      <AvatarFallback className="bg-emerald-700 text-[11px] font-bold text-white sm:text-xs">
        {letter}
      </AvatarFallback>
    </Avatar>
  );
}

export function publisherLabel(author?: CaseAuthor | null, district?: string) {
  if (author?.name?.trim()) return author.name.trim();
  if (district) return `${district} · নজর`;
  return "নজর";
}
