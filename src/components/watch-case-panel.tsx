"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Gavel,
  Hash,
  Landmark,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { ArchiveCase, LegalStatusKey } from "@/lib/types";
import { formatCount } from "@/lib/engagement";
import { ACCUSED_PARTIES, partyLabel, type AccusedPartyKey } from "@/lib/parties";
import { STATUS_META, normalizeStatus } from "@/lib/status";
import { CRIME_CATEGORIES } from "@/lib/categories";
import { COMMUNITY } from "@/lib/community";
import { normalizeTags, tagsToInput } from "@/lib/tags";
import {
  clearStudio,
  getStudioName,
  staffEditCase,
} from "@/lib/studio";
import { useStudioSession } from "@/hooks/use-studio-session";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/status-chip";
import {
  LocationFields,
  type LocationValue,
} from "@/components/location-fields";
import { cn } from "@/lib/utils";

type TabKey = "desc" | "source" | "legal" | "meta";

type SourceDraft = { t: string; p: string; url: string };

const field =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15";
const area =
  "w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm leading-relaxed outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15";

function toDateInput(raw?: string | null) {
  if (!raw) return "";
  const s = String(raw).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}

function locFromCase(c: ArchiveCase): LocationValue {
  return {
    division: c.division || "",
    district: c.district || "",
    upazila: c.upazila || "",
    thana: c.thana || "",
    village: c.village || "",
  };
}

/**
 * One clean panel: Case ID + desc/source/legal (+ staff meta).
 * Public sees simple tabs; staff edits inside the same card.
 */
export function WatchCasePanel({
  c,
  views,
  onUpdated,
}: {
  c: ArchiveCase;
  views: number;
  onUpdated: (patch: Partial<ArchiveCase>) => void;
}) {
  const { loggedIn } = useStudioSession();
  const [staffName, setStaffName] = useState("");
  const [tab, setTab] = useState<TabKey>("desc");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);

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

  const [title, setTitle] = useState(c.title);
  const [location, setLocation] = useState<LocationValue>(() => locFromCase(c));
  const [category, setCategory] = useState(c.crime_category || "");
  const [tagsInput, setTagsInput] = useState(tagsToInput(c.tags));

  const caseId = (c.case_id || "").trim();
  const partyText = partyLabel(c.accused_party);

  const tabs: { key: TabKey; label: string; icon: typeof FileText }[] = [
    { key: "desc", label: "বিবরণ", icon: FileText },
    { key: "source", label: "সূত্র", icon: ExternalLink },
    { key: "legal", label: "আইনি", icon: Gavel },
    ...(loggedIn
      ? ([{ key: "meta" as const, label: "মেটা", icon: MapPin }] as const)
      : []),
  ];

  useEffect(() => {
    setStaffName(getStudioName());
  }, [loggedIn]);

  useEffect(() => {
    setSummary(c.summary || "");
    setParty((c.accused_party as AccusedPartyKey) || "");
    setSources(c.sources.map((s) => ({ t: s.t, p: s.p, url: s.url || "" })));
    setStatus(normalizeStatus(c.status));
    setVerdict(c.verdict_summary || "");
    setCaseNumber(c.case_number || "");
    setIncidentDate(toDateInput(c.incident_date));
    setTitle(c.title);
    setLocation(locFromCase(c));
    setCategory(c.crime_category || "");
    setTagsInput(tagsToInput(c.tags));
    setEditing(false);
    setErr("");
    setMsg("");
  }, [c.slug, c]);

  useEffect(() => {
    if (!loggedIn) {
      setEditing(false);
      setTab((t) => (t === "meta" ? "desc" : t));
    }
  }, [loggedIn]);

  async function copyCaseId() {
    if (!caseId) return;
    try {
      await navigator.clipboard.writeText(caseId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  function resetDrafts() {
    setSummary(c.summary || "");
    setParty((c.accused_party as AccusedPartyKey) || "");
    setSources(c.sources.map((s) => ({ t: s.t, p: s.p, url: s.url || "" })));
    setStatus(normalizeStatus(c.status));
    setVerdict(c.verdict_summary || "");
    setCaseNumber(c.case_number || "");
    setIncidentDate(toDateInput(c.incident_date));
    setTitle(c.title);
    setLocation(locFromCase(c));
    setCategory(c.crime_category || "");
    setTagsInput(tagsToInput(c.tags));
  }

  async function saveTab() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      let body: Parameters<typeof staffEditCase>[1] = {
        note: "watch panel edit",
      };
      if (tab === "desc") {
        body = { ...body, summary: summary.trim(), accused_party: party };
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
      } else if (tab === "legal") {
        body = {
          ...body,
          legal_status: status,
          verdict_summary: verdict.trim(),
          case_number: caseNumber.trim(),
          incident_date: incidentDate || null,
        };
      } else {
        body = {
          ...body,
          title: title.trim(),
          district: location.district.trim(),
          division: location.division.trim(),
          upazila: location.upazila.trim(),
          thana: location.thana.trim(),
          village: location.village.trim(),
          crime_category: category || undefined,
          tags: normalizeTags(tagsInput),
          visibility: "published",
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
      } else if (tab === "legal") {
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
        if (nextStatus !== c.status) {
          patch.timeline = [
            { s: STATUS_META[nextStatus].label, d: "এখন", done: true },
            ...c.timeline,
          ];
        }
        setStatus(nextStatus);
      } else {
        patch.title = res.title || title;
        patch.district = res.district || location.district;
        patch.division = res.division || location.division;
        patch.upazila = res.upazila || location.upazila;
        patch.thana = res.thana || location.thana;
        patch.village = res.village || location.village;
        patch.crime_category = res.crime_category || category;
        patch.tags = Array.isArray(res.tags)
          ? res.tags
          : normalizeTags(tagsInput);
      }

      onUpdated(patch);
      setMsg("সেভ হয়েছে");
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  async function onMetaSubmit(e: FormEvent) {
    e.preventDefault();
    await saveTab();
  }

  const mailto = caseId
    ? `mailto:${COMMUNITY.team.email}?subject=${encodeURIComponent(`Case ID ${caseId}`)}`
    : `mailto:${COMMUNITY.team.email}?subject=${encodeURIComponent(COMMUNITY.team.subject)}`;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-border/50 bg-card">
      {/* Case ID — always one clear place */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-3.5 py-2.5 sm:px-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {caseId ? (
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-muted/80 px-2.5 py-1 font-mono text-[12px] font-semibold tracking-tight text-foreground sm:text-[13px]">
              <Hash className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{caseId}</span>
            </span>
          ) : (
            <span className="text-[12px] text-muted-foreground">Case ID নেই</span>
          )}
          {caseId ? (
            <>
              <button
                type="button"
                onClick={() => void copyCaseId()}
                className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                title="কপি"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "কপি" : "কপি"}
              </button>
              <a
                href={mailto}
                className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium text-primary transition hover:bg-primary/10"
              >
                <Mail className="h-3.5 w-3.5" />
                ইমেইল
              </a>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <StatusChip status={c.status} />
          {loggedIn ? (
            <span className="hidden text-[11px] text-muted-foreground sm:inline">
              {staffName || "স্টাফ"}
            </span>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="কেস তথ্য"
        className="flex gap-0 border-b border-border/60 bg-muted/20 px-1"
      >
        {tabs.map((t) => {
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
                "relative flex flex-1 items-center justify-center gap-1.5 px-1.5 py-2.5 text-[12px] font-semibold tracking-tight transition sm:text-[13px]",
                on
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
              {t.label}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-2 -bottom-px h-[2px] rounded-full transition-all",
                  on ? "scale-x-100 bg-primary" : "scale-x-0 bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="px-3.5 py-3 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] text-muted-foreground">
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
                      resetDrafts();
                    }}
                  >
                    বাতিল
                  </Button>
                  {tab !== "meta" ? (
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
                  ) : null}
                </>
              ) : (
                <>
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full px-2 text-[11px] text-muted-foreground"
                    onClick={() => clearStudio()}
                  >
                    লগআউট
                  </Button>
                </>
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

        {/* বিবরণ */}
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

        {/* সূত্র */}
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

        {/* আইনি */}
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
                    {(Object.keys(STATUS_META) as LegalStatusKey[]).map((k) => (
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

        {/* মেটা — staff only */}
        {tab === "meta" && loggedIn ? (
          <form onSubmit={onMetaSubmit} className="mt-3 space-y-3">
            {editing ? (
              <>
                <label className="block space-y-1.5">
                  <span className="text-[12px] font-medium text-muted-foreground">
                    শিরোনাম
                  </span>
                  <input
                    className={field}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </label>
                <div>
                  <p className="mb-1.5 text-[12px] font-medium text-muted-foreground">
                    এলাকা
                  </p>
                  <LocationFields
                    compact
                    value={location}
                    onChange={setLocation}
                  />
                </div>
                <label className="block space-y-1.5">
                  <span className="text-[12px] font-medium text-muted-foreground">
                    ক্যাটাগরি
                  </span>
                  <select
                    className={field}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">—</option>
                    {CRIME_CATEGORIES.filter((x) => x.key !== "all").map((x) => (
                      <option key={x.key} value={x.key}>
                        {x.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[12px] font-medium text-muted-foreground">
                    হ্যাশট্যাগ
                  </span>
                  <input
                    className={field}
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="#বিএনপি #হুমকি"
                  />
                </label>
                <p className="text-[11px] text-muted-foreground">
                  ভিডিও সরাতে{" "}
                  <a
                    href={`mailto:${COMMUNITY.team.email}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {COMMUNITY.team.email}
                  </a>
                </p>
                <Button
                  type="submit"
                  disabled={busy}
                  className="h-10 rounded-full px-5"
                >
                  {busy ? "সেভ…" : "সেভ"}
                </Button>
              </>
            ) : (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">শিরোনাম · </span>
                  {c.title}
                </p>
                <p>
                  <span className="text-muted-foreground">এলাকা · </span>
                  {[c.village, c.thana, c.upazila, c.district, c.division]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">ক্যাটাগরি · </span>
                  {CRIME_CATEGORIES.find((x) => x.key === c.crime_category)
                    ?.label ||
                    c.crime_category ||
                    "—"}
                </p>
                {c.tags?.length ? (
                  <p>
                    <span className="text-muted-foreground">ট্যাগ · </span>
                    {c.tags.join(" ")}
                  </p>
                ) : null}
              </div>
            )}
          </form>
        ) : null}
      </div>
    </div>
  );
}
