"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { submitCase } from "@/lib/api";
import { CRIME_CATEGORIES } from "@/lib/categories";
import { ACCUSED_PARTIES, type AccusedPartyKey } from "@/lib/parties";
import { YtShell } from "@/components/yt-shell";
import { LocationFields, EMPTY_LOCATION, type LocationValue } from "@/components/location-fields";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";

function SubmitForm() {
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [category, setCategory] = useState("");
  const [party, setParty] = useState<AccusedPartyKey>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!location.district.trim()) {
      setError("জেলা বাধ্যতামূলক।");
      return;
    }
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await submitCase({
        title: String(fd.get("title") || ""),
        source_url: String(fd.get("source_url") || ""),
        description: String(fd.get("description") || ""),
        division: location.division,
        district: location.district,
        upazila: location.upazila,
        thana: location.thana,
        village: location.village,
        crime_category: category,
        accused_party: party || undefined,
      });
      if (res?.ok) setOk(true);
      else setError(res?.error || "Failed");
    } catch {
      setError("নেটওয়ার্ক ত্রুটি — আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "mb-4 gap-1 text-primary",
        )}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Create</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          জেলা বাধ্যতামূলক। উপজেলা, থানা ও গ্রাম ঐচ্ছিক।
        </p>
        {ok ? (
          <p className="mt-5 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
            জমা হয়েছে। কেস প্রকাশিত হয়েছে।
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <label className="block space-y-1.5 text-sm font-semibold">
              Video link
              <Input name="source_url" required placeholder="https://..." />
            </label>
            <label className="block space-y-1.5 text-sm font-semibold">
              Title
              <Input name="title" required />
            </label>
            <label className="block space-y-1.5 text-sm font-semibold">
              অপরাধের ধরন
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectClass}
              >
                <option value="">ক্যাটাগরি (ঐচ্ছিক)</option>
                {CRIME_CATEGORIES.filter((c) => c.key !== "all").map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-semibold">
              কোন দলের বিরুদ্ধে অভিযোগ
              <select
                value={party}
                onChange={(e) => setParty(e.target.value as AccusedPartyKey)}
                className={selectClass}
              >
                {ACCUSED_PARTIES.map((p) => (
                  <option key={p.key || "none"} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-semibold">
              Description
              <Textarea name="description" className="min-h-24" />
            </label>
            <LocationFields value={location} onChange={setLocation} />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Uploading…" : "Submit for review"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={null}>
      <YtShell>
        <SubmitForm />
      </YtShell>
    </Suspense>
  );
}
