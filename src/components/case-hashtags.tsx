"use client";

import Link from "next/link";
import { displayTag } from "@/lib/tags";
import { cn } from "@/lib/utils";

export function CaseHashtags({
  tags,
  className,
  linkSearch = true,
}: {
  tags?: string[] | null;
  className?: string;
  /** Clicking a tag opens home search for that hashtag */
  linkSearch?: boolean;
}) {
  const list = (tags || []).map((t) => t.replace(/^#+/, "").trim()).filter(Boolean);
  if (list.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {list.map((t) => {
        const label = displayTag(t);
        const classNames =
          "rounded-md bg-secondary/90 px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-secondary sm:text-[12px]";
        if (!linkSearch) {
          return (
            <span key={t} className={classNames}>
              {label}
            </span>
          );
        }
        return (
          <Link
            key={t}
            href={`/?q=${encodeURIComponent(t)}`}
            className={classNames}
            onClick={(e) => e.stopPropagation()}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
