"use client";

import { useState } from "react";
import { Clock, ExternalLink, FileText, Gavel, Landmark } from "lucide-react";
import type { ArchiveCase } from "@/lib/types";
import { formatCount } from "@/lib/engagement";
import { partyLabel } from "@/lib/parties";
import { cn } from "@/lib/utils";

type TabKey = "desc" | "source" | "legal";

const TABS: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: "desc", label: "বিবরণ", icon: FileText },
  { key: "source", label: "সূত্র", icon: ExternalLink },
  { key: "legal", label: "আইনি", icon: Gavel },
];

export function WatchDescTabs({
  c,
  views,
}: {
  c: ArchiveCase;
  views: number;
}) {
  const [tab, setTab] = useState<TabKey>("desc");
  const party = partyLabel(c.accused_party);

  return (
    <div className="mt-3 overflow-hidden rounded-xl bg-secondary/80">
      <div className="flex items-center gap-0.5 border-b border-border/40 px-1.5 pt-1.5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-semibold transition sm:text-[13px]",
                on
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="px-3.5 py-3">
        <p className="text-[12px] font-medium text-muted-foreground">
          {formatCount(views)} views
          {c.date && c.date !== "—" ? ` · ${c.date}` : ""}
          {party ? ` · ${party}` : ""}
        </p>

        {tab === "desc" ? (
          <div className="mt-2 space-y-2">
            <p className="text-sm leading-relaxed text-foreground/90">
              {c.summary}
            </p>
            {party ? (
              <p className="inline-flex items-center gap-1.5 rounded-md bg-background/70 px-2 py-1 text-[12px] font-medium text-foreground/80">
                <Landmark className="h-3.5 w-3.5" />
                অভিযোগ: {party}
              </p>
            ) : null}
          </div>
        ) : null}

        {tab === "source" ? (
          <div className="mt-2 space-y-1">
            {c.sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">সূত্র যোগ হয়নি</p>
            ) : (
              c.sources.map((s, i) => {
                const href = s.url?.trim();
                const inner = (
                  <>
                    <span className="min-w-0">
                      {s.t}{" "}
                      <span className="text-muted-foreground">· {s.p}</span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </>
                );
                return href ? (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 rounded-lg py-1.5 text-sm hover:underline"
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 py-1.5 text-sm text-muted-foreground"
                  >
                    {inner}
                  </div>
                );
              })
            )}
          </div>
        ) : null}

        {tab === "legal" ? (
          <div className="mt-2 space-y-1.5">
            {c.timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">আইনি ইতিহাস নেই</p>
            ) : (
              c.timeline.map((tl, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      tl.done ? "bg-foreground" : "bg-border",
                    )}
                  />
                  <div>
                    <p
                      className={
                        tl.done ? "font-medium" : "text-muted-foreground"
                      }
                    >
                      {tl.s}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {tl.d}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
