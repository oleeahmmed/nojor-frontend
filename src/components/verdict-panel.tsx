"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Gavel, Scale } from "lucide-react";
import type { ArchiveCase } from "@/lib/types";
import { hasVerdict, STATUS_META, VERDICT_FALLBACK } from "@/lib/status";
import {
  fetchVerdict,
  formatCount,
  voteVerdict,
  type VerdictPoll,
} from "@/lib/engagement";
import { useIdentity } from "./identity-provider";
import { cn } from "@/lib/utils";

const CHOICES = [
  { key: "agree" as const, label: "সহমত" },
  { key: "disagree" as const, label: "দ্বিমত" },
  { key: "neutral" as const, label: "কোনো মতামত নেই" },
];

export function VerdictPanel({ c }: { c: ArchiveCase }) {
  const show = c.has_verdict || hasVerdict(c.status);
  const { requireName } = useIdentity();
  const [open, setOpen] = useState(false);
  const [poll, setPoll] = useState<VerdictPoll | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPoll(null);
    setOpen(false);
  }, [c.slug]);

  useEffect(() => {
    if (!show || !open || poll) return;
    void fetchVerdict(c.slug).then(setPoll);
  }, [show, open, poll, c.slug]);

  if (!show) return null;

  const meta = STATUS_META[c.status];
  const summary =
    poll?.summary || c.verdict_summary || VERDICT_FALLBACK[c.status] || "";
  const date = poll?.date || c.verdict_date;
  const caseNo = poll?.case_number || c.case_number || "";
  const agree = poll?.agree ?? c.verdict_agree ?? 0;
  const disagree = poll?.disagree ?? c.verdict_disagree ?? 0;
  const neutral = poll?.neutral ?? c.verdict_neutral ?? 0;
  const total = agree + disagree + neutral;
  const mine = poll?.my ?? null;

  async function onVote(action: "agree" | "disagree" | "neutral") {
    if (busy) return;
    const name = await requireName();
    if (!name) return;
    setBusy(true);
    const next = mine === action ? "clear" : action;
    try {
      const r = await voteVerdict(c.slug, next);
      if (r?.ok) setPoll(r);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 overflow-hidden rounded-xl bg-secondary/80">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="brand-gradient flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
          <Gavel className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold">বিচার দেখুন</span>
          <span className="block text-[12px] text-muted-foreground">
            {meta.label}
            {total > 0 ? ` · ${formatCount(total)} জন মত দিয়েছে` : ""}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4.5 w-4.5 shrink-0 text-muted-foreground transition",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="border-t border-border/60 px-4 pb-4 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
              style={{ background: meta.soft, color: meta.tone }}
            >
              <Scale className="h-3.5 w-3.5" />
              {meta.label}
            </span>
            {caseNo ? (
              <span className="text-[12px] text-muted-foreground">
                মামলা {caseNo}
              </span>
            ) : null}
            {date ? (
              <span className="text-[12px] text-muted-foreground">
                · {formatBnDate(date)}
              </span>
            ) : null}
          </div>

          {summary ? (
            <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/90">
              {summary}
            </p>
          ) : null}

          <p className="mt-4 mb-2 text-[12px] font-medium text-muted-foreground">
            আপনি কি এই রায়ের সাথে একমত?
          </p>
          <div className="flex flex-wrap gap-2">
            {CHOICES.map((ch) => {
              const on = mine === ch.key;
              const count =
                ch.key === "agree"
                  ? agree
                  : ch.key === "disagree"
                    ? disagree
                    : neutral;
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <button
                  key={ch.key}
                  type="button"
                  disabled={busy}
                  onClick={() => void onVote(ch.key)}
                  className={cn(
                    "relative overflow-hidden rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-primary/40 hover:bg-muted/50",
                  )}
                >
                  {ch.label}
                  {total > 0 ? (
                    <span className={cn("ml-1.5", on ? "opacity-80" : "text-muted-foreground")}>
                      {pct}%
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {total > 0 ? (
            <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-muted">
              {agree > 0 ? (
                <div
                  className="bg-emerald-500"
                  style={{ width: `${(agree / total) * 100}%` }}
                />
              ) : null}
              {disagree > 0 ? (
                <div
                  className="bg-rose-500"
                  style={{ width: `${(disagree / total) * 100}%` }}
                />
              ) : null}
              {neutral > 0 ? (
                <div
                  className="bg-muted-foreground/40"
                  style={{ width: `${(neutral / total) * 100}%` }}
                />
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-[11.5px] text-muted-foreground">
              প্রথম মতটি আপনার হতে পারে।
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function formatBnDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
