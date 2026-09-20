"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { useApp } from "./providers";
import { THEMES, THEME_SWATCH, type ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

/** Standalone theme picker — no Base UI Menu (Label/Group crash + nested mobile menu). */
export function ThemeSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  /** Inline chips only (for “আরও” sheet) — no floating panel */
  compact?: boolean;
}) {
  const { theme, setTheme, colorMode, toggleColorMode } = useApp();
  const dark = colorMode === "dark";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(id: ThemeId) {
    setTheme(id);
    if (!compact) setOpen(false);
  }

  const list = (
    <div className={cn("space-y-1", compact && "w-full")}>
      <p className="px-1 pb-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        রঙের থিম
      </p>
      {THEMES.map((t) => {
        const on = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => pick(t.id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition",
              on ? "bg-muted" : "hover:bg-muted/70",
            )}
          >
            <span
              className="size-5 shrink-0 rounded-full shadow-inner ring-1 ring-black/10"
              style={{ backgroundImage: THEME_SWATCH[t.id] }}
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium text-foreground">
                {t.label}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {t.hint}
              </span>
            </span>
            {on ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
          </button>
        );
      })}
      <div className="my-1.5 h-px bg-border/70" />
      <button
        type="button"
        onClick={() => {
          toggleColorMode();
          if (!compact) setOpen(false);
        }}
        className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-muted/70"
      >
        {dark ? (
          <Sun className="h-4 w-4 text-amber-500" />
        ) : (
          <Moon className="h-4 w-4 text-sky-600" />
        )}
        <span className="flex-1 text-[13px] font-medium">
          {dark ? "লাইট মোড" : "ডার্ক মোড"}
        </span>
      </button>
    </div>
  );

  if (compact) {
    return <div className={cn("px-1 py-1", className)}>{list}</div>;
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-full text-foreground outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:size-9"
        aria-label="থিম"
        aria-expanded={open}
        title="থিম ও মোড"
      >
        <Palette className="h-5 w-5" />
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="থিম বাছাই"
          className="absolute right-0 top-[calc(100%+6px)] z-[80] min-w-[220px] rounded-2xl border border-border/60 bg-popover p-1.5 text-popover-foreground shadow-xl"
        >
          {list}
        </div>
      ) : null}
    </div>
  );
}
