"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mediaUrl } from "@/lib/studio";
import type { CaseAuthor } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  const src = mediaUrl(author?.avatar_url);
  const letter = (name || district || "ন").slice(0, 1);

  return (
    <Avatar size={size} className={cn("shrink-0", className)}>
      {src ? <AvatarImage src={src} alt={name || "publisher"} /> : null}
      <AvatarFallback className="bg-primary text-[11px] font-bold text-primary-foreground sm:text-xs">
        {letter}
      </AvatarFallback>
    </Avatar>
  );
}

export function publisherLabel(author?: CaseAuthor | null, district?: string) {
  if (author?.name?.trim()) return author.name.trim();
  if (district) return `${district} · নজর`;
  return "নজর আর্কাইভ";
}
