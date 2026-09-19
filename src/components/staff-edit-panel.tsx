"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Shield } from "lucide-react";
import { CRIME_CATEGORIES } from "@/lib/categories";
import { ACCUSED_PARTIES, type AccusedPartyKey } from "@/lib/parties";
import { normalizeTags, tagsToInput } from "@/lib/tags";
import { STATUS_META, normalizeStatus } from "@/lib/status";
import type { ArchiveCase, LegalStatusKey } from "@/lib/types";
import {
  clearStudio,
  getStudioName,
  isStudioLoggedIn,
  staffEditCase,
} from "@/lib/studio";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/status-chip";

const STATUS_OPTIONS = Object.keys(STATUS_META) as LegalStatusKey[];

const field =
  "mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm";
const area =
  "mt-1 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm";
const labelCls = "block text-[12px] font-medium text-muted-foreground";

function toDateInput(raw?: string | null) {
  if (!raw) return "";
  const s = String(raw).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}

export function StaffEditPanel({
  caseData,
  onUpdated,
}: {
  caseData: ArchiveCase;
  onUpdated: (patch: Partial<ArchiveCase>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [title, setTitle] = useState(caseData.title);
  const [summary, setSummary] = useState(caseData.summary || "");
  const [district, setDistrict] = useState(caseData.district || "");
  const [division, setDivision] = useState(caseData.division || "");
  const [upazila, setUpazila] = useState(caseData.upazila || "");
  const [thana, setThana] = useState(caseData.thana || "");
  const [village, setVillage] = useState(caseData.village || "");
  const [category, setCategory] = useState(caseData.crime_category || "");
  const [party, setParty] = useState<AccusedPartyKey>(
    (caseData.accused_party as AccusedPartyKey) || "",
  );
  const [tagsInput, setTagsInput] = useState(tagsToInput(caseData.tags));
  const [caseNumber, setCaseNumber] = useState(caseData.case_number || "");
  const [status, setStatus] = useState<LegalStatusKey>(
    normalizeStatus(caseData.status),
  );
  const [verdict, setVerdict] = useState(caseData.verdict_summary || "");
  const [incidentDate, setIncidentDate] = useState("");
  // Team users cannot hide/delete — visibility stays published

  useEffect(() => {
    const sync = () => {
      setLoggedIn(isStudioLoggedIn());
      setStaffName(getStudioName());
    };
    sync();
    window.addEventListener("nojor-studio", sync);
    return () => window.removeEventListener("nojor-studio", sync);
  }, []);

  useEffect(() => {
    setTitle(caseData.title);
    setSummary(caseData.summary || "");
    setDistrict(caseData.district || "");
    setDivision(caseData.division || "");
    setUpazila(caseData.upazila || "");
    setThana(caseData.thana || "");
    setVillage(caseData.village || "");
    setCategory(caseData.crime_category || "");
    setParty((caseData.accused_party as AccusedPartyKey) || "");
    setTagsInput(tagsToInput(caseData.tags));
    setCaseNumber(caseData.case_number || "");
    setStatus(normalizeStatus(caseData.status));
    setVerdict(caseData.verdict_summary || "");
    setIncidentDate(toDateInput(caseData.incident_date));
    setMsg("");
    setErr("");
  }, [caseData.slug, caseData]);

  if (!loggedIn) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await staffEditCase(caseData.slug, {
        title: title.trim(),
        summary: summary.trim(),
        district: district.trim(),
        division: division.trim(),
        upazila: upazila.trim(),
        thana: thana.trim(),
        village: village.trim(),
        crime_category: category || undefined,
        accused_party: party,
        tags: normalizeTags(tagsInput),
        case_number: caseNumber.trim(),
        legal_status: status,
        verdict_summary: verdict.trim(),
        visibility: "published",
        incident_date: incidentDate || null,
        note: "frontend staff edit",
      });
      if (!res?.ok) {
        if (String(res?.error || "").includes("লগইন")) {
          clearStudio();
          setLoggedIn(false);
        }
        setErr(res?.error || "সেভ হয়নি।");
        return;
      }
      const nextStatus = normalizeStatus(res.legal_status || status);
      onUpdated({
        title: res.title || title,
        summary: res.summary || summary,
        district: res.district || district,
        division: res.division || division,
        upazila: res.upazila || upazila,
        thana: res.thana || thana,
        village: res.village || village,
        crime_category: res.crime_category || category,
        accused_party: res.accused_party ?? party,
        tags: Array.isArray(res.tags) ? res.tags : normalizeTags(tagsInput),
        case_number: res.case_number || caseNumber,
        status: nextStatus,
        verdict_summary: res.verdict_summary || verdict,
        has_verdict: ["convicted", "acquitted", "dismissed"].includes(
          nextStatus,
        ),
      });
      setMsg(res.message || "সেভ হয়েছে।");
      setOpen(false);
    } catch {
      setErr("সার্ভারে সংযোগ হয়নি।");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-border/80 bg-muted/30 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4 text-primary" />
          স্টাফ এডিট · {staffName || "টিম"}
        </div>
        <div className="flex items-center gap-2">
          <StatusChip status={status} />
          <Button
            type="button"
            size="sm"
            variant={open ? "secondary" : "default"}
            className="rounded-full"
            onClick={() => setOpen((v) => !v)}
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            {open ? "বন্ধ" : "এডিট"}
          </Button>
        </div>
      </div>

      {open ? (
        <form onSubmit={onSubmit} className="mt-3 space-y-3">
          <label className={labelCls}>
            শিরোনাম
            <input
              className={field}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className={labelCls}>
            সারাংশ
            <textarea
              className={area}
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <label className={labelCls}>
              জেলা
              <input
                className={field}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </label>
            <label className={labelCls}>
              বিভাগ
              <input
                className={field}
                value={division}
                onChange={(e) => setDivision(e.target.value)}
              />
            </label>
            <label className={labelCls}>
              উপজেলা
              <input
                className={field}
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
              />
            </label>
            <label className={labelCls}>
              থানা
              <input
                className={field}
                value={thana}
                onChange={(e) => setThana(e.target.value)}
              />
            </label>
            <label className={labelCls}>
              গ্রাম/এলাকা
              <input
                className={field}
                value={village}
                onChange={(e) => setVillage(e.target.value)}
              />
            </label>
            <label className={labelCls}>
              মামলা নং
              <input
                className={field}
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className={labelCls}>
              ক্যাটাগরি
              <select
                className={field}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">—</option>
                {CRIME_CATEGORIES.filter((c) => c.key !== "all").map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              অভিযুক্ত দল
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
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className={labelCls}>
              আইনি অবস্থা
              <select
                className={field}
                value={status}
                onChange={(e) => setStatus(e.target.value as LegalStatusKey)}
              >
                {STATUS_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {STATUS_META[k].label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              ঘটনার তারিখ
              <input
                type="date"
                className={field}
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
            </label>
          </div>
          <p className="rounded-lg bg-muted/50 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            ভিডিও সরানো বা লুকানো যায় না। দরকার হলে{" "}
            <a
              href="mailto:tips.nojor@gmail.com?subject=%E0%A6%A8%E0%A6%9C%E0%A6%B0%20%E0%A6%9F%E0%A6%BF%E0%A6%AE%20%E2%80%94%20%E0%A6%AD%E0%A6%BF%E0%A6%A1%E0%A6%BF%E0%A6%93%20%E0%A6%B8%E0%A6%B0%E0%A6%BE%E0%A6%A8%E0%A7%8B"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              tips.nojor@gmail.com
            </a>{" "}
            এ নজর টিমকে ইমেইল করুন।
          </p>
          <label className={labelCls}>
            হ্যাশট্যাগ (সার্চের জন্য)
            <input
              className={field}
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="#বিএনপি #হুমকি #পটুয়াখালী"
            />
          </label>
          <label className={labelCls}>
            রায় / নোট
            <textarea
              className={area}
              rows={2}
              value={verdict}
              onChange={(e) => setVerdict(e.target.value)}
              placeholder="রায়ের সংক্ষিপ্ত বিবরণ…"
            />
          </label>

          {err ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err}
            </p>
          ) : null}
          {msg ? (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
              {msg}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={busy}
              className="h-10 rounded-full px-5"
            >
              {busy ? "সেভ হচ্ছে…" : "সব সেভ করুন"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-full"
              onClick={() => {
                clearStudio();
                setLoggedIn(false);
                setOpen(false);
              }}
            >
              লগআউট
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          শিরোনাম, সারাংশ, এলাকা, ক্যাটাগরি, আইনি অবস্থা, রায় — সব এখান থেকে
          আপডেট করা যায়।
        </p>
      )}
    </div>
  );
}
