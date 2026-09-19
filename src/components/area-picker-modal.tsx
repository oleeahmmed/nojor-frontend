"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, MapPin, Search } from "lucide-react";
import { useApp } from "./providers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type BdDivision = {
  bn: string;
  districts: { bn: string }[];
};

export function AreaPickerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { homeDistrict, setHomeDistrict } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [divisions, setDivisions] = useState<BdDivision[]>([]);
  const [counts, setCounts] = useState<Map<string, number>>(new Map());
  const [caseTotal, setCaseTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [division, setDivision] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setDivision(null);
    let alive = true;
    fetch("/data/bd-locations.json")
      .then((r) => r.json())
      .then((j: { divisions?: BdDivision[] }) => {
        if (alive) setDivisions(j.divisions || []);
      })
      .catch(() => {
        if (alive) setDivisions([]);
      });
    const api = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
    fetch(`${api}/api/cases`)
      .then((r) => r.json())
      .then((list: { district?: string }[]) => {
        if (!alive || !Array.isArray(list)) return;
        const map = new Map<string, number>();
        for (const c of list) {
          if (!c.district) continue;
          map.set(c.district, (map.get(c.district) || 0) + 1);
        }
        setCounts(map);
        setCaseTotal(list.length);
      })
      .catch(() => {
        if (alive) {
          setCounts(new Map());
          setCaseTotal(0);
        }
      });
    return () => {
      alive = false;
    };
  }, [open]);

  const divisionRows = useMemo(() => {
    return divisions
      .map((div) => {
        const n = div.districts.reduce(
          (sum, d) => sum + (counts.get(d.bn) || 0),
          0,
        );
        return { name: div.bn, districts: div.districts.length, cases: n };
      })
      .sort((a, b) => b.cases - a.cases || a.name.localeCompare(b.name, "bn"));
  }, [divisions, counts]);

  const districtRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows: { name: string; division: string; cases: number }[] = [];
    for (const div of divisions) {
      if (division && div.bn !== division) continue;
      for (const d of div.districts) {
        if (q && !d.bn.toLowerCase().includes(q) && !div.bn.toLowerCase().includes(q)) {
          continue;
        }
        rows.push({
          name: d.bn,
          division: div.bn,
          cases: counts.get(d.bn) || 0,
        });
      }
    }
    return rows.sort(
      (a, b) => b.cases - a.cases || a.name.localeCompare(b.name, "bn"),
    );
  }, [divisions, counts, division, query]);

  function pick(name: string) {
    setHomeDistrict(name);
    onClose();
    if (pathname.startsWith("/cases")) router.push("/");
  }

  const searching = query.trim().length > 0;
  const showDistricts = searching || !!division;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="flex max-h-[min(640px,86vh)] flex-col gap-0 overflow-hidden border-0 p-0 sm:max-w-[440px]"
        overlayClassName="bg-black/50"
      >
        <DialogHeader className="shrink-0 px-5 pb-3 pt-4">
          <DialogTitle className="text-[18px] font-semibold">এলাকা</DialogTitle>
          <DialogDescription className="text-[13px]">
            জেলা বেছে সেই এলাকার কেস দেখুন — আলাদা পেজ লাগে না।
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 px-5 pb-3">
          <label className="flex h-10 items-center gap-2 rounded-full bg-secondary px-3.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim()) setDivision(null);
              }}
              placeholder="জেলা বা বিভাগ খুঁজুন"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {showDistricts ? (
            <>
              {!searching && division ? (
                <button
                  type="button"
                  onClick={() => setDivision(null)}
                  className="mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                  সব বিভাগ
                </button>
              ) : null}

              {districtRows.map((d) => {
                const on = homeDistrict === d.name;
                return (
                  <button
                    key={`${d.division}-${d.name}`}
                    type="button"
                    onClick={() => pick(d.name)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-muted",
                      on && "bg-muted",
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{d.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {d.division}
                        {d.cases ? ` · ${d.cases} কেস` : " · এখনো কেস নেই"}
                      </span>
                    </span>
                    {on ? (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                );
              })}

              {districtRows.length === 0 ? (
                <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                  কোনো জেলা পাওয়া যায়নি
                </p>
              ) : null}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => pick("")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-muted",
                  !homeDistrict && "bg-muted",
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">সব জেলা</span>
                  <span className="block text-xs text-muted-foreground">
                    {caseTotal}টি যাচাইকৃত কেস
                  </span>
                </span>
                {!homeDistrict ? (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                ) : null}
              </button>

              <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                বিভাগ
              </p>

              {divisionRows.map((d) => (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => setDivision(d.name)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-muted"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-primary">
                    {d.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{d.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {d.districts} জেলা
                      {d.cases ? ` · ${d.cases} কেস` : ""}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
