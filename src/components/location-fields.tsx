"use client";

import { useEffect, useMemo, useState, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type BdUpazila = {
  bn: string;
  en: string;
  grams: string[];
};

export type BdDistrict = {
  bn: string;
  en: string;
  upazilas: BdUpazila[];
};

export type BdDivision = {
  bn: string;
  en: string;
  districts: BdDistrict[];
};

type LocationsFile = {
  divisions?: BdDivision[];
  /** legacy flat shape */
  districts?: BdDistrict[];
};

export type LocationValue = {
  division: string;
  district: string;
  upazila: string;
  thana: string;
  village: string;
};

export const EMPTY_LOCATION: LocationValue = {
  division: "",
  district: "",
  upazila: "",
  thana: "",
  village: "",
};

function SelectField({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative w-full min-w-0">
      <select
        {...props}
        className={cn(
          "block h-11 w-full min-w-0 appearance-none rounded-xl border border-input",
          "bg-background py-2 pl-3 pr-10 text-sm text-foreground",
          "outline-none transition-colors",
          "focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

function FieldLabel({
  children,
  hint,
  required,
}: {
  children: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <span className="mb-1.5 block text-[13px] font-medium text-foreground">
      {children}
      {required ? <span className="text-destructive"> *</span> : null}
      {hint ? (
        <span className="ml-1 font-normal text-muted-foreground">{hint}</span>
      ) : null}
    </span>
  );
}

export function LocationFields({
  value,
  onChange,
  className,
  compact,
}: {
  value?: LocationValue;
  onChange?: (v: LocationValue) => void;
  className?: string;
  /** Single-column stack — better inside narrow modal columns */
  compact?: boolean;
}) {
  const [divisions, setDivisions] = useState<BdDivision[]>([]);
  const [local, setLocal] = useState<LocationValue>(value ?? EMPTY_LOCATION);

  useEffect(() => {
    let alive = true;
    fetch("/data/bd-locations.json")
      .then((r) => r.json())
      .then((j: LocationsFile) => {
        if (!alive) return;
        if (j.divisions?.length) setDivisions(j.divisions);
        else if (j.districts?.length) {
          setDivisions([
            { bn: "সব", en: "All", districts: j.districts },
          ]);
        }
      })
      .catch(() => {
        if (alive) setDivisions([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (value) setLocal(value);
  }, [value]);

  function patch(next: Partial<LocationValue>) {
    const merged = { ...local, ...next };
    setLocal(merged);
    onChange?.(merged);
  }

  const division = useMemo(
    () => divisions.find((d) => d.bn === local.division),
    [divisions, local.division],
  );

  const districts = division?.districts ?? [];

  const districtObj = useMemo(
    () => districts.find((d) => d.bn === local.district),
    [districts, local.district],
  );

  const upazilas = districtObj?.upazilas ?? [];
  const gramSource =
    upazilas.find((u) => u.bn === local.upazila) ||
    upazilas.find((u) => u.bn === local.thana);
  const grams = gramSource?.grams ?? [];

  function onDivisionChange(bn: string) {
    patch({
      division: bn,
      district: "",
      upazila: "",
      thana: "",
      village: "",
    });
  }

  function onDistrictChange(bn: string) {
    let div = local.division;
    if (bn) {
      const found = divisions.find((d) =>
        d.districts.some((x) => x.bn === bn),
      );
      if (found) div = found.bn;
    }
    patch({
      division: div,
      district: bn,
      upazila: "",
      thana: "",
      village: "",
    });
  }

  const pair = compact
    ? "grid grid-cols-1 gap-3"
    : "grid grid-cols-1 gap-3 sm:grid-cols-2";

  return (
    <div className={cn("w-full min-w-0 space-y-3", className)}>
      <div className={pair}>
        <label className="block w-full min-w-0">
          <FieldLabel hint="(সহজ খোঁজা)">বিভাগ</FieldLabel>
          <SelectField
            name="division"
            value={local.division}
            onChange={(e) => onDivisionChange(e.target.value)}
          >
            <option value="">বিভাগ বাছুন</option>
            {divisions.map((d) => (
              <option key={d.bn} value={d.bn}>
                {d.bn}
              </option>
            ))}
          </SelectField>
        </label>

        <label className="block w-full min-w-0">
          <FieldLabel required>জেলা</FieldLabel>
          <SelectField
            required
            name="district"
            value={local.district}
            onChange={(e) => onDistrictChange(e.target.value)}
          >
            <option value="">
              {local.division ? "জেলা বাছুন" : "বিভাগ বা জেলা বাছুন"}
            </option>
            {(local.division
              ? districts
              : divisions.flatMap((d) => d.districts)
            ).map((d) => (
              <option key={d.bn} value={d.bn}>
                {d.bn}
              </option>
            ))}
          </SelectField>
        </label>
      </div>

      <div className={pair}>
        <label className="block w-full min-w-0">
          <FieldLabel hint="(ঐচ্ছিক)">উপজেলা</FieldLabel>
          <SelectField
            name="upazila"
            value={local.upazila}
            disabled={!local.district}
            onChange={(e) =>
              patch({
                upazila: e.target.value,
                village: "",
              })
            }
          >
            <option value="">উপজেলা বাছুন</option>
            {upazilas.map((u) => (
              <option key={u.bn} value={u.bn}>
                {u.bn}
              </option>
            ))}
          </SelectField>
        </label>

        <label className="block w-full min-w-0">
          <FieldLabel hint="(ঐচ্ছিক)">থানা</FieldLabel>
          <SelectField
            name="thana"
            value={local.thana}
            disabled={!local.district}
            onChange={(e) =>
              patch({
                thana: e.target.value,
                village: local.upazila ? local.village : "",
              })
            }
          >
            <option value="">থানা বাছুন</option>
            {upazilas.map((u) => (
              <option key={`t-${u.bn}`} value={u.bn}>
                {u.bn}
              </option>
            ))}
          </SelectField>
        </label>
      </div>

      <label className="block w-full min-w-0">
        <FieldLabel hint="(ঐচ্ছিক)">গ্রাম / ইউনিয়ন</FieldLabel>
        <SelectField
          name="village"
          value={local.village}
          disabled={!local.upazila && !local.thana}
          onChange={(e) => patch({ village: e.target.value })}
        >
          <option value="">গ্রাম / ইউনিয়ন বাছুন</option>
          {grams.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </SelectField>
      </label>
    </div>
  );
}
