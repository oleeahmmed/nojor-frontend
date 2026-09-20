"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Shield } from "lucide-react";
import { CRIME_CATEGORIES } from "@/lib/categories";
import { COMMUNITY } from "@/lib/community";
import { normalizeTags, tagsToInput } from "@/lib/tags";
import type { ArchiveCase } from "@/lib/types";
import {
  clearStudio,
  getStudioName,
  isStudioLoggedIn,
  staffEditCase,
} from "@/lib/studio";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/status-chip";

const field =
  "mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm";
const labelCls = "block text-[12px] font-medium text-muted-foreground";

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
  const [district, setDistrict] = useState(caseData.district || "");
  const [division, setDivision] = useState(caseData.division || "");
  const [upazila, setUpazila] = useState(caseData.upazila || "");
  const [thana, setThana] = useState(caseData.thana || "");
  const [village, setVillage] = useState(caseData.village || "");
  const [category, setCategory] = useState(caseData.crime_category || "");
  const [tagsInput, setTagsInput] = useState(tagsToInput(caseData.tags));

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
    setDistrict(caseData.district || "");
    setDivision(caseData.division || "");
    setUpazila(caseData.upazila || "");
    setThana(caseData.thana || "");
    setVillage(caseData.village || "");
    setCategory(caseData.crime_category || "");
    setTagsInput(tagsToInput(caseData.tags));
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
        district: district.trim(),
        division: division.trim(),
        upazila: upazila.trim(),
        thana: thana.trim(),
        village: village.trim(),
        crime_category: category || undefined,
        tags: normalizeTags(tagsInput),
        visibility: "published",
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
      onUpdated({
        title: res.title || title,
        district: res.district || district,
        division: res.division || division,
        upazila: res.upazila || upazila,
        thana: res.thana || thana,
        village: res.village || village,
        crime_category: res.crime_category || category,
        tags: Array.isArray(res.tags) ? res.tags : normalizeTags(tagsInput),
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
          <StatusChip status={caseData.status} />
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
          </div>
          <p className="rounded-lg bg-muted/50 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            বিবরণ · সূত্র · আইনি অবস্থা নিচের ট্যাব থেকে এডিট করুন। ভিডিও সরাতে{" "}
            <a
              href={`mailto:${COMMUNITY.team.email}?subject=${encodeURIComponent(COMMUNITY.team.subject)}`}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {COMMUNITY.team.email}
            </a>
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
          শিরোনাম, এলাকা, ক্যাটাগরি, ট্যাগ — এখান থেকে। বিবরণ/সূত্র/আইনি নিচের
          ট্যাবে।
        </p>
      )}
    </div>
  );
}
