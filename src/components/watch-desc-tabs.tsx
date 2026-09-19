"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Clock,
  ExternalLink,
  FileText,
  Gavel,
  Landmark,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { ArchiveCase, LegalStatusKey } from "@/lib/types";
import { formatCount } from "@/lib/engagement";
import { ACCUSED_PARTIES, partyLabel, type AccusedPartyKey } from "@/lib/parties";
import { STATUS_META, normalizeStatus } from "@/lib/status";
import { clearStudio, staffEditCase } from "@/lib/studio";
import { useStudioSession } from "@/hooks/use-studio-session";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/status-chip";
import { cn } from "@/lib/utils";

type TabKey = "desc" | "source" | "legal";

const TABS: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: "desc", label: "বিবরণ", icon: FileText },
  { key: "source", label: "সূত্র", icon: ExternalLink },
  { key: "legal", label: "আইনি", icon: Gavel },
];

const STATUS_OPTIONS = Object.keys(STATUS_META) as LegalStatusKey[];

const field =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15";
const area =
  "w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm leading-relaxed outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15";

type SourceDraft = { t: string; p: string; url: string };

function toDateInput(raw?: string | null) {
  if (!raw) return "";
  const s = String(raw).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}

export function WatchDescTabs({
  c,
  views,
  onUpdated,
}: {
  c: ArchiveCase;
  views: number;
  onUpdated?: (patch: Partial<ArchiveCase>) => void;
}) {
  const { loggedIn } = useStudioSession();
  const [tab, setTab] = useState<TabKey>("desc");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [summary, setSummary] = useState(c.summary || "");
  const [party, setParty] = useState<AccusedPartyKey>(
    (c.accused_party as AccusedPartyKey) || "",
  );
  const [sources, setSources] = useState<SourceDraft[]>(
    c.sources.map((s) => ({ t: s.t, p: s.p, url: s.url || "" })),
  );
  const [status, setStatus] = useState<LegalStatusKey>(normalizeStatus(c.status));
  const [verdict, setVerdict] = useState(c.verdict_summary || "");
  const [caseNumber, setCaseNumber] = useState(c.case_number || "");
  const [incidentDate, setIncidentDate] = useState(toDateInput(c.incident_date));

  useEffect(() => {
    setSummary(c.summary || "");
    setParty((c.accused_party as AccusedPartyKey) || "");
    setSources(c.sources.map((s) => ({ t: s.t, p: s.p, url: s.url || "" })));
    setStatus(normalizeStatus(c.status));
    setVerdict(c.verdict_summary || "");
    setCaseNumber(c.case_number || "");
    setIncidentDate(toDateInput(c.incident_date));
    setEditing(false);
    setErr("");
    setMsg("");
  }, [c.slug, c]);

  useEffect(() => {
    if (!loggedIn) setEditing(false);
  }, [loggedIn]);

  const partyText = partyLabel(c.accused_party);

  async function saveTab() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      let body: Parameters<typeof staffEditCase>[1] = { note: "watch tabs edit" };
      if (tab === "desc") {
        body = {
          ...body,
          summary: summary.trim(),
          accused_party: party,
        };
      } else if (tab === "source") {
        body = {
          ...body,
          sources: sources
            .filter((s) => s.t.trim() || s.p.trim())
            .map((s) => ({
              title: s.t.trim() || s.p.trim() || "সূত্র",
              publisher: s.p.trim(),
              url: s.url.trim(),
            })),
        };
      } else {
        body = {
          ...body,
          legal_status: status,
          verdict_summary: verdict.trim(),
          case_number: caseNumber.trim(),
          incident_date: incidentDate || null,
        };
      }

      const res = await staffEditCase(c.slug, body);
      if (!res?.ok) {
        if (String(res?.error || "").includes("লগইন")) clearStudio();
        setErr(res?.error || "সেভ হয়নি।");
        return;
      }

      const patch: Partial<ArchiveCase> = {};
      if (tab === "desc") {
        patch.summary = res.summary || summary.trim();
        patch.accused_party = res.accused_party ?? party;
      } else if (tab === "source") {
        const next =
          res.sources?.map((s) => ({
            t: s.title,
            p: s.publisher || "",
            url: s.url || undefined,
          })) ||
          sources
            .filter((s) => s.t.trim() || s.p.trim())
            .map((s) => ({
              t: s.t.trim() || s.p.trim(),
              p: s.p.trim(),
              url: s.url.trim() || undefined,
            }));
        patch.sources = next;
        setSources(next.map((s) => ({ t: s.t, p: s.p, url: s.url || "" })));
      } else {
        const nextStatus = normalizeStatus(res.legal_status || status);
        patch.status = nextStatus;
        patch.verdict_summary = res.verdict_summary ?? verdict.trim();
        patch.case_number = res.case_number ?? caseNumber.trim();
        patch.incident_date = res.incident_date ?? (incidentDate || null);
        patch.has_verdict = ["convicted", "acquitted", "dismissed"].includes(
          nextStatus,
        );
        if (res.incident_date) {
          patch.date = String(res.incident_date).slice(0, 10);
        }
        // Optimistic timeline tip
        if (nextStatus !== c.status) {
          patch.timeline = [
            {
              s: STATUS_META[nextStatus].label,
              d: "এখন",
              done: true,
            },
            ...c.timeline,
          ];
        }
        setStatus(nextStatus);
      }

      onUpdated?.(patch);
      setMsg("সেভ হয়েছে");
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      {/* Tab rail — underline style */}
      <div
        role="tablist"
        aria-label="ভিডিও তথ্য"
        className="relative flex gap-0 border-b border-border/70 bg-muted/25 px-1"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                setTab(t.key);
                setEditing(false);
                setErr("");
                setMsg("");
              }}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-[13px] font-semibold tracking-tight transition sm:text-[14px]",
                on
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              <Icon
                className={cn("h-3.5 w-3.5 shrink-0", on ? "opacity-100" : "opacity-70")}
              />
              {t.label}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3 -bottom-px h-[2.5px] rounded-full transition-all",
                  on ? "bg-primary scale-x-100" : "scale-x-0 bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="px-3.5 py-3.5 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-medium text-muted-foreground">
            {formatCount(views)} views
            {c.date && c.date !== "—" ? ` · ${c.date}` : ""}
            {partyText ? ` · ${partyText}` : ""}
          </p>
          {loggedIn ? (
            <div className="flex items-center gap-1.5">
              {editing ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full px-3 text-[12px]"
                    disabled={busy}
                    onClick={() => {
                      setEditing(false);
                      setErr("");
                      setMsg("");
                      setSummary(c.summary || "");
                      setParty((c.accused_party as AccusedPartyKey) || "");
                      setSources(
                        c.sources.map((s) => ({
                          t: s.t,
                          p: s.p,
                          url: s.url || "",
                        })),
                      );
                      setStatus(normalizeStatus(c.status));
                      setVerdict(c.verdict_summary || "");
                      setCaseNumber(c.case_number || "");
                      setIncidentDate(toDateInput(c.incident_date));
                    }}
                  >
                    বাতিল
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={busy}
                    className="h-8 rounded-full gap-1 px-3 text-[12px]"
                    onClick={() => void saveTab()}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {busy ? "সেভ…" : "সেভ"}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full gap-1 px-3 text-[12px]"
                  onClick={() => {
                    setEditing(true);
                    setErr("");
                    setMsg("");
                  }}
                >
                  <Pencil className="h-3 w-3" />
                  এডিট
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {err ? (
          <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
            {err}
          </p>
        ) : null}
        {msg ? (
          <p className="mt-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-700 dark:text-emerald-400">
            {msg}
          </p>
        ) : null}

        {tab === "desc" ? (
          <div className="mt-3 space-y-3">
            {editing ? (
              <>
                <label className="block space-y-1.5">
                  <span className="text-[12px] font-medium text-muted-foreground">
                    বিবরণ
                  </span>
                  <textarea
                    className={area}
                    rows={5}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="ঘটনার সংক্ষিপ্ত বিবরণ…"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[12px] font-medium text-muted-foreground">
                    অভিযুক্ত দল
                  </span>
                  <select
                    className={field}
                    value={party}
                    onChange={(e) =>
                      setParty(e.target.value as AccusedPartyKey)
                    }
                  >
                    {ACCUSED_PARTIES.map((p) => (
                      <option key={p.key || "none"} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <>
                <p className="text-[14px] leading-relaxed text-foreground/90 sm:text-[15px]">
                  {c.summary || "বিবরণ নেই"}
                </p>
                {partyText ? (
                  <p className="inline-flex items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1.5 text-[12px] font-medium text-foreground/85">
                    <Landmark className="h-3.5 w-3.5" />
                    অভিযোগ: {partyText}
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {tab === "source" ? (
          <div className="mt-3 space-y-2">
            {editing ? (
              <>
                {sources.map((s, i) => (
                  <div
                    key={i}
                    className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        সূত্র {i + 1}
                      </p>
                      <button
                        type="button"
                        className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() =>
                          setSources((prev) => prev.filter((_, j) => j !== i))
                        }
                        aria-label="সরান"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      className={field}
                      value={s.t}
                      onChange={(e) =>
                        setSources((prev) =>
                          prev.map((row, j) =>
                            j === i ? { ...row, t: e.target.value } : row,
                          ),
                        )
                      }
                      placeholder="শিরোনাম"
                    />
                    <input
                      className={field}
                      value={s.p}
                      onChange={(e) =>
                        setSources((prev) =>
                          prev.map((row, j) =>
                            j === i ? { ...row, p: e.target.value } : row,
                          ),
                        )
                      }
                      placeholder="প্রকাশক"
                    />
                    <input
                      className={field}
                      value={s.url}
                      onChange={(e) =>
                        setSources((prev) =>
                          prev.map((row, j) =>
                            j === i ? { ...row, url: e.target.value } : row,
                          ),
                        )
                      }
                      placeholder="https://…"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 w-full rounded-xl gap-1.5"
                  onClick={() =>
                    setSources((prev) => [...prev, { t: "", p: "", url: "" }])
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  সূত্র যোগ
                </Button>
              </>
            ) : c.sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">সূত্র যোগ হয়নি</p>
            ) : (
              <ul className="space-y-1">
                {c.sources.map((s, i) => {
                  const href = s.url?.trim();
                  const inner = (
                    <>
                      <span className="min-w-0">
                        <span className="font-medium">{s.t}</span>
                        {s.p ? (
                          <span className="text-muted-foreground"> · {s.p}</span>
                        ) : null}
                      </span>
                      {href ? (
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      ) : null}
                    </>
                  );
                  return href ? (
                    <li key={i}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-2.5 text-sm transition hover:bg-muted/60"
                      >
                        {inner}
                      </a>
                    </li>
                  ) : (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-2.5 text-sm text-muted-foreground"
                    >
                      {inner}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}

        {tab === "legal" ? (
          <div className="mt-3 space-y-3">
            {editing ? (
              <>
                <label className="block space-y-1.5">
                  <span className="text-[12px] font-medium text-muted-foreground">
                    আইনি অবস্থা
                  </span>
                  <select
                    className={field}
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as LegalStatusKey)
                    }
                  >
                    {STATUS_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {STATUS_META[k].label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-[12px] font-medium text-muted-foreground">
                      মামলা নং
                    </span>
                    <input
                      className={field}
                      value={caseNumber}
                      onChange={(e) => setCaseNumber(e.target.value)}
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[12px] font-medium text-muted-foreground">
                      ঘটনার তারিখ
                    </span>
                    <input
                      type="date"
                      className={field}
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                    />
                  </label>
                </div>
                <label className="block space-y-1.5">
                  <span className="text-[12px] font-medium text-muted-foreground">
                    রায় / নোট
                  </span>
                  <textarea
                    className={area}
                    rows={3}
                    value={verdict}
                    onChange={(e) => setVerdict(e.target.value)}
                    placeholder="রায়ের সংক্ষিপ্ত বিবরণ…"
                  />
                </label>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip status={c.status} />
                  {c.case_number ? (
                    <span className="rounded-md bg-muted/70 px-2 py-1 text-[12px] text-muted-foreground">
                      মামলা: {c.case_number}
                    </span>
                  ) : null}
                </div>
                {c.verdict_summary ? (
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {c.verdict_summary}
                  </p>
                ) : null}
                {c.timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground">আইনি ইতিহাস নেই</p>
                ) : (
                  <ol className="relative space-y-3 border-l border-border/80 pl-4">
                    {c.timeline.map((tl, i) => (
                      <li key={i} className="relative text-sm">
                        <span
                          className={cn(
                            "absolute -left-[1.28rem] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-card",
                            tl.done ? "bg-primary" : "bg-border",
                          )}
                        />
                        <p
                          className={
                            tl.done
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {tl.s}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {tl.d}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
