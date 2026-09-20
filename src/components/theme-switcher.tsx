"use client";

import { Check, Moon, Palette, Sun } from "lucide-react";
import { useApp } from "./providers";
import { THEMES, THEME_SWATCH, type ThemeId } from "@/lib/themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme, setTheme, colorMode, toggleColorMode } = useApp();
  const dark = colorMode === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex size-10 items-center justify-center rounded-full text-foreground outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:size-9"
        aria-label="থিম"
        title="থিম ও মোড"
      >
        <Palette className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[220px] overflow-hidden rounded-2xl border-border/60 p-1.5 shadow-xl"
      >
        <DropdownMenuLabel className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          রঙের থিম
        </DropdownMenuLabel>
        {THEMES.map((t) => {
          const on = theme === t.id;
          return (
            <DropdownMenuItem
              key={t.id}
              className={cn(
                "gap-2.5 rounded-xl px-2.5 py-2",
                on && "bg-muted",
              )}
              onClick={() => setTheme(t.id as ThemeId)}
            >
              <span
                className="size-5 shrink-0 rounded-full shadow-inner ring-1 ring-black/10"
                style={{ backgroundImage: THEME_SWATCH[t.id] }}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium">{t.label}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {t.hint}
                </span>
              </span>
              {on ? <Check className="h-4 w-4 text-primary" /> : null}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator className="my-1.5" />
        <DropdownMenuItem
          className="gap-2.5 rounded-xl px-2.5 py-2"
          onClick={toggleColorMode}
        >
          {dark ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-sky-600" />
          )}
          <span className="flex-1 text-[13px] font-medium">
            {dark ? "লাইট মোড" : "ডার্ক মোড"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
