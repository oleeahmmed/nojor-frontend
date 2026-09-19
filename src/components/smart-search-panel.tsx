"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CalendarRange, Filter, RotateCcw, Search } from "lucide-react";
import { CRIME_CATEGORIES } from "@/lib/categories";
import { FILTERS } from "@/lib/status";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type LocData = {
  divisions?: {
    bn: string;
    districts?: { bn: string; upazilas?: { bn: string }[] }[];
  }[];
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

/**
 * Smart search panel — date range, area, category, status → URL → server API.
 */
export function SmartSearchPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [locs, setLocs] = useState<LocData | null>(null);

  const [q, setQ] = useState(params.get("q") || "");
  const [dateFrom, setDateFrom] = useState(params.get("from") || "");
  const [dateTo, setDateTo] = useState(params.get("to") || "");
  const [division, setDivision] = useState(params.get("division") || "");
  const [district, setDistrict] = useState(params.get("district") || "");
  const [upazila, setUpazila] = useState(params.get("upazila") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [status, setStatus] = useState(params.get("status") || "");
  const [sort, setSort] = useState(params.get("sort") || "rank");

  useEffect(() => {
    setQ(params.get("q") || "");
    setDateFrom(params.get("from") || "");
    setDateTo(params.get("to") || "");
    setDivision(params.get("division") || "");
    setDistrict(params.get("district") || "");
    setUpazila(params.get("upazila") || "");
    setCategory(params.get("category") || "");
    setStatus(params.get("status") || "");
    setSort(params.get("sort") || "rank");
  }, [params]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/meta/locations/`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setLocs(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const districts = useMemo(() => {
    if (!locs?.divisions || !division) return [];
    const div = locs.divisions.find((d) => d.bn === division);
    return div?.districts || [];
  }, [locs, division]);

  const upazilas = useMemo(() => {
    if (!district) return [];
    const d = districts.find((x) => x.bn === district);
    return d?.upazilas || [];
  }, [districts, district]);

  const activeCount = [
    q,
    dateFrom,
    dateTo,
    division,
    district,
    upazila,
    category,
    status,
    sort !== "rank" ? sort : "",
  ].filter(Boolean).length;

  function apply() {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (dateFrom) sp.set("from", dateFrom);
    if (dateTo) sp.set("to", dateTo);
    if (division) sp.set("division", division);
    if (district) sp.set("district", district);
    if (upazila) sp.set("upazila", upazila);
    if (category) sp.set("category", category);
    if (status) sp.set("status", status);
    if (sort && sort !== "rank") sp.set("sort", sort);
    const qs = sp.toString();
    router.push(qs ? `/?${qs}` : "/");
    setOpen(false);
  }

  function reset() {
    setQ("");
    setDateFrom("");
    setDateTo("");
    setDivision("");
    setDistrict("");
    setUpazila("");
    setCategory("");
    setStatus("");
    setSort("rank");
    router.push("/");
    setOpen(false);
  }

  return (
    <div className="w-full min-w-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-2 rounded-xl border px-3 text-[12.5px] font-medium transition sm:h-9",
          open || activeCount
            ? "border-emerald-600/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
            : "border-border bg-secondary/60 text-foreground hover:bg-secondary",
        )}
      >
        <span className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          স্মার্ট সার্চ
          {activeCount ? (
            <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </span>
        <CalendarRange className="h-3.5 w-3.5 opacity-70" />
      </button>

      {open ? (
        <div className="mt-2 space-y-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-3.5">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
              কীওয়ার্ড
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="শিরোনাম, এলাকা, কেস নম্বর…"
                className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
                তারিখ থেকে
              </span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-2 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
                তারিখ পর্যন্ত
              </span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-2 text-sm outline-none"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Select
              label="বিভাগ"
              value={division}
              onChange={(v) => {
                setDivision(v);
                setDistrict("");
                setUpazila("");
              }}
              options={(locs?.divisions || []).map((d) => d.bn)}
            />
            <Select
              label="জেলা"
              value={district}
              onChange={(v) => {
                setDistrict(v);
                setUpazila("");
              }}
              options={districts.map((d) => d.bn)}
              disabled={!division}
            />
            <Select
              label="উপজেলা"
              value={upazila}
              onChange={setUpazila}
              options={upazilas.map((u) => u.bn)}
              disabled={!district}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Select
              label="অপরাধ ক্যাটাগরি"
              value={category}
              onChange={setCategory}
              options={CRIME_CATEGORIES.filter((c) => c.key !== "all").map(
                (c) => c.key,
              )}
              labels={Object.fromEntries(
                CRIME_CATEGORIES.map((c) => [c.key, c.label]),
              )}
            />
            <Select
              label="আইনি অবস্থা"
              value={status}
              onChange={setStatus}
              options={FILTERS.filter((f) => f.key !== "all").map((f) => f.key)}
              labels={Object.fromEntries(FILTERS.map((f) => [f.key, f.label]))}
            />
            <Select
              label="সাজানো"
              value={sort}
              onChange={setSort}
              options={["rank", "new", "viral"]}
              labels={{
                rank: "নজর Nest (স্মার্ট)",
                new: "নতুন আগে",
                viral: "ভাইরাল আগে",
              }}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              className="h-9 flex-1 rounded-full"
              onClick={reset}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              মুছুন
            </Button>
            <Button
              type="button"
              className="h-9 flex-[1.4] rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={apply}
            >
              খুঁজুন
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  labels,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
  disabled?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full min-w-0 rounded-xl border border-input bg-background px-2 text-sm outline-none disabled:opacity-50"
      >
        <option value="">সব</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] || o}
          </option>
        ))}
      </select>
    </label>
  );
}
