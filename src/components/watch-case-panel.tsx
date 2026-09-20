"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Hash,
  Mail,
  MapPin,
  Newspaper,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { ArchiveCase, LegalStatusKey } from "@/lib/types";
import { formatCount } from "@/lib/engagement";
import { ACCUSED_PARTIES, partyLabel, type AccusedPartyKey } from "@/lib/parties";
import { STATUS_META, normalizeStatus } from "@/lib/status";
import { CRIME_CATEGORIES, categoryLabel } from "@/lib/categories";
import { COMMUNITY } from "@/lib/community";
import { normalizeTags, tagsToInput } from "@/lib/tags";
import { clearStudio, getStudioName, staffEditCase } from "@/lib/studio";
import { useStudioSession } from "@/hooks/use-studio-session";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/status-chip";
import {
  LocationFields,
  type LocationValue,
} from "@/components/location-fields";
import { cn } from "@/lib/utils";

type TabKey = "overview" | "detail" | "area";
type SourceDraft = { t: string; p: string; url: string };

const input =
  "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-[13px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15";
const textarea =
  "w-full resize-y rounded-lg border border-input bg-background px-2.5 py-2 text-[13px] leading-relaxed outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15";

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

/** GSMArena-style label | value — fits 2-col grid */
function SpecRow({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  /** Full width in multi-column grid */
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-xl border border-border/60 bg-background px-2.5 py-2 sm:gap-3 sm:px-3 sm:py-2.5",
        wide && "sm:col-span-2",
      )}
    >
      <div className="w-[28%] shrink-0 pt-0.5 text-[11px] font-medium text-muted-foreground sm:w-28 sm:text-[12px]">
        {label}
      </div>
      <div className="min-w-0 flex-1 text-[12px] leading-snug text-foreground sm:text-[13px]">
        {children || <span className="text-muted-foreground">—</span>}
      </div>
    </div>
  );
}

function SpecBlock({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-2xl bg-muted/40 p-2 sm:grid-cols-2 sm:gap-2 sm:p-2.5">
      {children}
    </div>
  );
}

const TABS: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: "overview", label: "বিবরণ", icon: FileText },
  { key: "detail", label: "বিস্তারিত", icon: Newspaper },
  { key: "area", label: "এলাকা", icon: MapPin },
];

/**
 * Tabs only (no row above). Case ID + edit chrome goes to title line via onChrome.
 */
export function WatchCasePanel({
  c,
  views,
  onUpdated,
  onChrome,
}: {
  c: ArchiveCase;
  views: number;
  onUpdated: (patch: Partial<ArchiveCase>) => void;
  /** Mount Case ID + staff actions on the title row */
  onChrome?: (node: ReactNode | null) => void;
}) {
  const { loggedIn } = useStudioSession();
  const [staffName, setStaffName] = useState("");
  const [tab, setTab] = useState<TabKey>("overview");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const [title, setTitle] = useState(c.title);
  const [summary, setSummary] = useState(c.summary || "");
  const [party, setParty] = useState<AccusedPartyKey>(
    (c.accused_party as AccusedPartyKey) || "",
  );
  const [category, setCategory] = useState(c.crime_category || "");
  const [status, setStatus] = useState<LegalStatusKey>(normalizeStatus(c.status));
  const [caseNumber, setCaseNumber] = useState(c.case_number || "");
  const [incidentDate, setIncidentDate] = useState(toDateInput(c.incident_date));
  const [verdict, setVerdict] = useState(c.verdict_summary || "");
  const [tagsInput, setTagsInput] = useState(tagsToInput(c.tags));
  const [location, setLocation] = useState<LocationValue>(() => locFromCase(c));
  const [locationText, setLocationText] = useState(c.location_text || "");
  const [policeStation, setPoliceStation] = useState(c.police_station || "");
  const [sources, setSources] = useState<SourceDraft[]>(
    c.sources.map((s) => ({ t: s.t, p: s.p, url: s.url || "" })),
  );

  const caseId = (c.case_id || "").trim();

  useEffect(() => {
    setStaffName(getStudioName());
  }, [loggedIn]);

  useEffect(() => {
    setTitle(c.title);
    setSummary(c.summary || "");
    setParty((c.accused_party as AccusedPartyKey) || "");
    setCategory(c.crime_category || "");
    setStatus(normalizeStatus(c.status));
    setCaseNumber(c.case_number || "");
    setIncidentDate(toDateInput(c.incident_date));
    setVerdict(c.verdict_summary || "");
    setTagsInput(tagsToInput(c.tags));
    setLocation(locFromCase(c));
    setLocationText(c.location_text || "");
    setPoliceStation(c.police_station || "");
    setSources(c.sources.map((s) => ({ t: s.t, p: s.p, url: s.url || "" })));
    setEditing(false);
    setErr("");
    setMsg("");
  }, [c.slug, c]);

  useEffect(() => {
    if (!loggedIn) setEditing(false);
  }, [loggedIn]);

  async function copyCaseId() {
    if (!caseId) return;
    try {
      await navigator.clipboard.writeText(caseId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function resetDrafts() {
    setTitle(c.title);
    setSummary(c.summary || "");
    setParty((c.accused_party as AccusedPartyKey) || "");
    setCategory(c.crime_category || "");
    setStatus(normalizeStatus(c.status));
    setCaseNumber(c.case_number || "");
    setIncidentDate(toDateInput(c.incident_date));
    setVerdict(c.verdict_summary || "");
    setTagsInput(tagsToInput(c.tags));
    setLocation(locFromCase(c));
    setLocationText(c.location_text || "");
    setPoliceStation(c.police_station || "");
    setSources(c.sources.map((s) => ({ t: s.t, p: s.p, url: s.url || "" })));
  }

  async function saveAll() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await staffEditCase(c.slug, {
        title: title.trim(),
        summary: summary.trim(),
        accused_party: party,
        crime_category: category || undefined,
        legal_status: status,
        case_number: caseNumber.trim(),
        incident_date: incidentDate || null,
        verdict_summary: verdict.trim(),
        tags: normalizeTags(tagsInput),
        district: location.district.trim(),
        division: location.division.trim(),
        upazila: location.upazila.trim(),
        thana: location.thana.trim(),
        village: location.village.trim(),
        location_text: locationText.trim(),
        police_station: policeStation.trim(),
        sources: sources
          .filter((s) => s.t.trim() || s.p.trim())
          .map((s) => ({
            title: s.t.trim() || s.p.trim() || "সূত্র",
            publisher: s.p.trim(),
            url: s.url.trim(),
          })),
        visibility: "published",
        note: "watch panel full edit",
      });

      if (!res?.ok) {
        if (String(res?.error || "").includes("লগইন")) clearStudio();
        setErr(res?.error || "সেভ হয়নি।");
        return;
      }

      const nextStatus = normalizeStatus(res.legal_status || status);
      const nextSources =
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

      onUpdated({
        title: res.title || title,
        summary: res.summary ?? summary.trim(),
        accused_party: res.accused_party ?? party,
        crime_category: res.crime_category || category,
        status: nextStatus,
        case_number: res.case_number ?? caseNumber.trim(),
        incident_date: res.incident_date ?? (incidentDate || null),
        date: res.incident_date
          ? String(res.incident_date).slice(0, 10)
          : c.date,
        verdict_summary: res.verdict_summary ?? verdict.trim(),
        tags: Array.isArray(res.tags) ? res.tags : normalizeTags(tagsInput),
        district: res.district || location.district,
        division: res.division || location.division,
        upazila: res.upazila || location.upazila,
        thana: res.thana || location.thana,
        village: res.village || location.village,
        location_text: res.location_text ?? locationText.trim(),
        police_station: res.police_station ?? policeStation.trim(),
        sources: nextSources,
        has_verdict: ["convicted", "acquitted", "dismissed"].includes(
          nextStatus,
        ),
        timeline:
          nextStatus !== c.status
            ? [
                { s: STATUS_META[nextStatus].label, d: "এখন", done: true },
                ...c.timeline,
              ]
            : c.timeline,
      });

      setSources(nextSources.map((s) => ({ t: s.t, p: s.p, url: s.url || "" })));
      setStatus(nextStatus);
      setMsg("সেভ হয়েছে");
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  const mailto = caseId
    ? `mailto:${COMMUNITY.team.email}?subject=${encodeURIComponent(`Case ID ${caseId}`)}`
    : `mailto:${COMMUNITY.team.email}?subject=${encodeURIComponent(COMMUNITY.team.subject)}`;

  const areaLine = [c.village, c.thana, c.upazila, c.district, c.division]
    .filter(Boolean)
    .join(", ");

  /* Push Case ID + actions up to title line (no row above tabs) */
  useEffect(() => {
    if (!onChrome) return;
    onChrome(
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
        {caseId ? (
          <span className="inline-flex max-w-[9.5rem] items-center gap-0.5 rounded-md bg-muted/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold sm:max-w-[14rem] sm:text-[11px]">
            <Hash className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="truncate">{caseId}</span>
          </span>
        ) : null}
        {caseId ? (
          <>
            <button
              type="button"
              onClick={() => void copyCaseId()}
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="কপি"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
            <a
              href={mailto}
              className="inline-flex size-7 items-center justify-center rounded-md text-primary hover:bg-primary/10"
              aria-label="ইমেইল"
            >
              <Mail className="h-3 w-3" />
            </a>
          </>
        ) : null}
        <StatusChip status={c.status} />
        {loggedIn ? (
          editing ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 rounded-full px-2 text-[11px]"
                disabled={busy}
                onClick={() => {
                  setEditing(false);
                  resetDrafts();
                  setErr("");
                  setMsg("");
                }}
              >
                বাতিল
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-7 rounded-full gap-1 px-2 text-[11px]"
                disabled={busy}
                onClick={() => void saveAll()}
              >
                <Check className="h-3 w-3" />
                {busy ? "…" : "সেভ"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-full gap-1 px-2 text-[11px]"
                onClick={() => {
                  setEditing(true);
                  setErr("");
                  setMsg("");
                }}
              >
                <Pencil className="h-3 w-3" />
                এডিট
              </Button>
              <button
                type="button"
                className="px-1 text-[10px] text-muted-foreground hover:text-foreground"
                onClick={() => clearStudio()}
                title={staffName || "লগআউট"}
              >
                লগআউট
              </button>
            </>
          )
        ) : null}
      </div>,
    );
    return () => onChrome(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chrome mirrors UI state
  }, [
    onChrome,
    caseId,
    copied,
    c.status,
    loggedIn,
    editing,
    busy,
    staffName,
    mailto,
  ]);

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-border/50 bg-card">
      {/* Tabs only — chrome is on title line */}
      <div
        role="tablist"
        className="flex border-b border-border/60 bg-muted/25"
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
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold sm:text-[13px]",
                on ? "text-foreground" : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              <Icon className="h-3.5 w-3.5 opacity-80" />
              {t.label}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3 -bottom-px h-[2px] rounded-full",
                  on ? "bg-primary" : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="p-2.5 sm:p-3">
        {err ? (
          <p className="mb-2 rounded-lg bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
            {err}
          </p>
        ) : null}
        {msg ? (
          <p className="mb-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-700 dark:text-emerald-400">
            {msg}
          </p>
        ) : null}

        {/* —— বিবরণ —— */}
        {tab === "overview" ? (
          <SpecBlock>
            <SpecRow label="Case ID">{caseId || "—"}</SpecRow>
            <SpecRow label="শিরোনাম" wide>
              {editing ? (
                <input
                  className={input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              ) : (
                c.title
              )}
            </SpecRow>
            <SpecRow label="ক্যাটাগরি">
              {editing ? (
                <select
                  className={input}
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
              ) : (
                categoryLabel(c.crime_category) || "—"
              )}
            </SpecRow>
            <SpecRow label="অভিযুক্ত">
              {editing ? (
                <select
                  className={input}
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
              ) : (
                partyLabel(c.accused_party) || "—"
              )}
            </SpecRow>
            <SpecRow label="আইনি অবস্থা">
              {editing ? (
                <select
                  className={input}
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
              ) : (
                <StatusChip status={c.status} />
              )}
            </SpecRow>
            <SpecRow label="মামলা নং">
              {editing ? (
                <input
                  className={input}
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                />
              ) : (
                c.case_number || "—"
              )}
            </SpecRow>
            <SpecRow label="ঘটনার তারিখ">
              {editing ? (
                <input
                  type="date"
                  className={input}
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                />
              ) : (
                (c.incident_date && String(c.incident_date).slice(0, 10)) ||
                (c.date !== "—" ? c.date : "—")
              )}
            </SpecRow>
            <SpecRow label="ট্যাগ">
              {editing ? (
                <input
                  className={input}
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="#ট্যাগ"
                />
              ) : c.tags?.length ? (
                c.tags.join(" ")
              ) : (
                "—"
              )}
            </SpecRow>
            <SpecRow label="ভিউ">{formatCount(views)}</SpecRow>
          </SpecBlock>
        ) : null}

        {/* —— বিস্তারিত —— */}
        {tab === "detail" ? (
          <SpecBlock>
            <SpecRow label="খবর / বিবরণ" wide>
              {editing ? (
                <textarea
                  className={textarea}
                  rows={5}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="বিস্তারিত বিবরণ…"
                />
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">
                  {c.summary || "—"}
                </p>
              )}
            </SpecRow>
            <SpecRow label="সূত্র" wide>
              {editing ? (
                <div className="space-y-2">
                  {sources.map((s, i) => (
                    <div
                      key={i}
                      className="space-y-1.5 rounded-lg border border-border/50 bg-muted/30 p-2"
                    >
                      <div className="flex justify-between">
                        <span className="text-[11px] text-muted-foreground">
                          সূত্র {i + 1}
                        </span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            setSources((prev) =>
                              prev.filter((_, j) => j !== i),
                            )
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        className={input}
                        placeholder="শিরোনাম"
                        value={s.t}
                        onChange={(e) =>
                          setSources((prev) =>
                            prev.map((row, j) =>
                              j === i ? { ...row, t: e.target.value } : row,
                            ),
                          )
                        }
                      />
                      <input
                        className={input}
                        placeholder="প্রকাশক"
                        value={s.p}
                        onChange={(e) =>
                          setSources((prev) =>
                            prev.map((row, j) =>
                              j === i ? { ...row, p: e.target.value } : row,
                            ),
                          )
                        }
                      />
                      <input
                        className={input}
                        placeholder="https://…"
                        value={s.url}
                        onChange={(e) =>
                          setSources((prev) =>
                            prev.map((row, j) =>
                              j === i ? { ...row, url: e.target.value } : row,
                            ),
                          )
                        }
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-full gap-1 rounded-lg text-[12px]"
                    onClick={() =>
                      setSources((prev) => [
                        ...prev,
                        { t: "", p: "", url: "" },
                      ])
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    সূত্র যোগ
                  </Button>
                </div>
              ) : c.sources.length === 0 ? (
                "—"
              ) : (
                <ul className="space-y-1.5">
                  {c.sources.map((s, i) => (
                    <li key={i}>
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-start gap-1 text-primary hover:underline"
                        >
                          <span>
                            {s.t}
                            {s.p ? (
                              <span className="text-muted-foreground">
                                {" "}
                                · {s.p}
                              </span>
                            ) : null}
                          </span>
                          <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
                        </a>
                      ) : (
                        <span>
                          {s.t}
                          {s.p ? ` · ${s.p}` : ""}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </SpecRow>
            <SpecRow label="রায় / নোট" wide>
              {editing ? (
                <textarea
                  className={textarea}
                  rows={3}
                  value={verdict}
                  onChange={(e) => setVerdict(e.target.value)}
                />
              ) : (
                c.verdict_summary || "—"
              )}
            </SpecRow>
            <SpecRow label="আইনি ইতিহাস" wide>
              {c.timeline.length === 0 ? (
                "—"
              ) : (
                <ol className="space-y-2">
                  {c.timeline.map((tl, i) => (
                    <li key={i} className="flex gap-2 text-[13px]">
                      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span>
                        <span
                          className={
                            tl.done ? "font-medium" : "text-muted-foreground"
                          }
                        >
                          {tl.s}
                        </span>
                        <span className="text-muted-foreground"> · {tl.d}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </SpecRow>
          </SpecBlock>
        ) : null}

        {/* —— এলাকা / তদন্ত —— */}
        {tab === "area" ? (
          <SpecBlock>
            {editing ? (
              <>
                <div className="rounded-xl border border-border/60 bg-background p-3 sm:col-span-2">
                  <p className="mb-2 text-[12px] font-medium text-muted-foreground">
                    এলাকা নির্বাচন
                  </p>
                  <LocationFields
                    compact
                    value={location}
                    onChange={setLocation}
                  />
                </div>
                <SpecRow label="ঠিকানা / নোট">
                  <input
                    className={input}
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder="অতিরিক্ত লোকেশন নোট"
                  />
                </SpecRow>
                <SpecRow label="থানা / তদন্ত">
                  <input
                    className={input}
                    value={policeStation}
                    onChange={(e) => setPoliceStation(e.target.value)}
                    placeholder="থানা / তদন্তকারী ইউনিট"
                  />
                </SpecRow>
              </>
            ) : (
              <>
                <SpecRow label="বিভাগ">{c.division || "—"}</SpecRow>
                <SpecRow label="জেলা">{c.district || "—"}</SpecRow>
                <SpecRow label="উপজেলা">{c.upazila || "—"}</SpecRow>
                <SpecRow label="থানা">{c.thana || "—"}</SpecRow>
                <SpecRow label="গ্রাম / এলাকা">{c.village || "—"}</SpecRow>
                <SpecRow label="সংক্ষেপে" wide>
                  {areaLine || "—"}
                </SpecRow>
                <SpecRow label="ঠিকানা নোট">
                  {c.location_text || "—"}
                </SpecRow>
                <SpecRow label="তদন্ত / থানা">
                  {c.police_station || "—"}
                </SpecRow>
              </>
            )}
          </SpecBlock>
        ) : null}
      </div>
    </div>
  );
}
