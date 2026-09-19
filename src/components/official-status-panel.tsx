"use client";

import { FormEvent, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { updateCaseLegalStatus } from "@/lib/api";
import { useApp } from "@/components/providers";
import { STATUS_META, normalizeStatus } from "@/lib/status";
import type { LegalStatusKey } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/status-chip";

const OPTIONS: { key: LegalStatusKey; hint: string }[] = [
  { key: "under_investigation", hint: "তদন্ত চলছে" },
  { key: "no_action", hint: "বিচার হয়নি / ব্যবস্থা নেই" },
  { key: "charged", hint: "অভিযোগপত্র দাখিল" },
  { key: "trial_ongoing", hint: "বিচার চলছে" },
  { key: "convicted", hint: "দণ্ডিত — রায়" },
  { key: "acquitted", hint: "খালাস — রায়" },
  { key: "dismissed", hint: "মামলা খারিজ" },
  { key: "reported", hint: "রিপোর্ট হয়েছে" },
];

export function OfficialStatusPanel({
  slug,
  district,
  currentStatus,
  onUpdated,
}: {
  slug: string;
  district: string;
  currentStatus: string;
  onUpdated: (status: LegalStatusKey, verdictSummary?: string) => void;
}) {
  const { role, district: officialDistrict, officialToken, clearOfficial } =
    useApp();
  const [status, setStatus] = useState<LegalStatusKey>(
    normalizeStatus(currentStatus),
  );
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setStatus(normalizeStatus(currentStatus));
  }, [currentStatus, slug]);

  if (role !== "official" || !officialToken) return null;

  const sameDistrict =
    (district || "").trim() === (officialDistrict || "").trim();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!sameDistrict) {
      setErr(`শুধু ${officialDistrict} এলাকার কেস আপডেট করা যায়।`);
      return;
    }
    setLoading(true);
    try {
      const res = await updateCaseLegalStatus(slug, officialToken, {
        status,
        note: note.trim() || undefined,
        verdict_summary: note.trim() || undefined,
      });
      if (res?.ok && res.legal_status) {
        const next = normalizeStatus(res.legal_status);
        onUpdated(next, res.verdict_summary);
        setMsg(res.message || "অবস্থা আপডেট হয়েছে।");
        setNote("");
        return;
      }
      if (res?.error?.includes("টোকেন") || res?.error?.includes("লগইন")) {
        clearOfficial();
      }
      setErr(res?.error || "আপডেট হয়নি।");
    } catch {
      setErr("সার্ভারে সংযোগ হয়নি।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-border/80 bg-muted/30 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          কেসের অবস্থা আপডেট
        </div>
        <StatusChip status={currentStatus} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        আপনার এলাকা: {officialDistrict}
        {!sameDistrict ? (
          <span className="text-destructive">
            {" "}
            — এই ভিডিও {district} এলাকার, আপডেট করা যাবে না।
          </span>
        ) : null}
      </p>

      {sameDistrict ? (
        <form onSubmit={onSubmit} className="mt-3 space-y-3">
          <label className="block space-y-1 text-[13px] font-medium">
            নতুন অবস্থা
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LegalStatusKey)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              {OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {STATUS_META[o.key].label} — {o.hint}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-[13px] font-medium">
            নোট / রায়ের সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="যেমন: তদন্ত চলছে / আদালত দোষী সাব্যস্ত…"
              className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
          <Button
            type="submit"
            disabled={loading}
            className="h-10 rounded-full px-5"
          >
            {loading ? "সেভ হচ্ছে…" : "অবস্থা সেভ করুন"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
