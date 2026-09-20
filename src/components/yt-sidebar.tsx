"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Gavel,
  Home,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useApp } from "./providers";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const ITEMS = [
  { key: "home", href: "/", label: "Home", short: "Home", icon: Home },
  {
    key: "viral",
    href: "/?view=viral",
    label: "Viral",
    short: "Viral",
    icon: TrendingUp,
  },
  {
    key: "trial",
    href: "/?view=trial",
    label: "বিচারাধীন",
    short: "বিচার",
    icon: Gavel,
  },
  {
    key: "noaction",
    href: "/?view=noaction",
    label: "বিচার হয়নি",
    short: "অমীমাংসিত",
    icon: AlertTriangle,
  },
  { key: "area", href: "", label: "এলাকা", short: "এলাকা", icon: MapPin },
];

function NavItems({
  active,
  compact,
  onNavigate,
  openAreaPicker,
  homeDistrict,
  areaPickerOpen,
}: {
  active: string;
  compact?: boolean;
  onNavigate?: () => void;
  openAreaPicker: () => void;
  homeDistrict: string;
  areaPickerOpen: boolean;
}) {
  return (
    <>
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const on =
          item.key === "area"
            ? areaPickerOpen || !!homeDistrict
            : active === item.key;

        if (compact) {
          const className = cn(
            "flex w-16 flex-col items-center gap-1 rounded-xl px-1 py-3 text-[10px] leading-tight text-foreground transition-colors",
            on ? "bg-muted font-medium" : "hover:bg-muted/70",
          );
          if (item.key === "area") {
            return (
              <button
                key={item.key}
                type="button"
                onClick={openAreaPicker}
                className={className}
              >
                <Icon className="h-5 w-5" strokeWidth={on ? 2.4 : 1.9} />
                <span className="max-w-full truncate text-center leading-tight">
                  {homeDistrict || item.short}
                </span>
              </button>
            );
          }
          return (
            <Link key={item.key} href={item.href} className={className}>
              <Icon className="h-5 w-5" strokeWidth={on ? 2.4 : 1.9} />
              <span className="max-w-full truncate text-center leading-tight">
                {item.short}
              </span>
            </Link>
          );
        }

        const className = cn(
          "flex w-full items-center gap-5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
          on
            ? "bg-muted font-semibold text-foreground"
            : "font-normal text-foreground/90 hover:bg-muted/70",
        );
        if (item.key === "area") {
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                openAreaPicker();
                onNavigate?.();
              }}
              className={className}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={on ? 2.4 : 1.9} />
              <span className="min-w-0">
                <span className="block">{item.label}</span>
                {homeDistrict ? (
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {homeDistrict}
                  </span>
                ) : null}
              </span>
            </button>
          );
        }
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={className}
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={on ? 2.4 : 1.9} />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function SidebarBody({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate?: () => void;
}) {
  const { homeDistrict, areaPickerOpen, openAreaPicker } = useApp();

  return (
    <>
      <nav className="space-y-0.5">
        <NavItems
          active={active}
          onNavigate={onNavigate}
          openAreaPicker={openAreaPicker}
          homeDistrict={homeDistrict}
          areaPickerOpen={areaPickerOpen}
        />
      </nav>
      <Separator className="my-3" />
      <div className="mt-2 space-y-2.5 px-3 text-xs leading-relaxed text-muted-foreground">
        <Link href="/about" className="block hover:text-foreground">
          আমাদের সম্পর্কে
        </Link>
        <Link href="/verification" className="block hover:text-foreground">
          কীভাবে যাচাই হয়
        </Link>
        <Link href="/corrections" className="block hover:text-foreground">
          সংশোধন নীতি
        </Link>
        <p className="pt-2 text-[11px]">© Nojor</p>
      </div>
    </>
  );
}

export function YtSidebar({
  open,
  mode = "dock",
  active,
  onNavigate,
}: {
  open: boolean;
  mode?: "dock" | "overlay";
  active: string;
  /** @deprecated Create/login removed from public sidebar */
  onCreate?: () => void;
  onNavigate?: () => void;
}) {
  const { homeDistrict, areaPickerOpen, openAreaPicker } = useApp();

  if (mode === "overlay") {
    return (
      <aside
        className={cn(
          "absolute inset-y-0 left-0 z-30 flex w-[min(var(--sidebar-w),85vw)] flex-col overflow-y-auto border-r border-border/60 bg-card px-3 py-3 shadow-2xl",
          "transition-transform duration-200",
          open ? "translate-x-0" : "pointer-events-none -translate-x-full",
        )}
      >
        <SidebarBody active={active} onNavigate={onNavigate} />
      </aside>
    );
  }

  return (
    <>
      <aside
        className={cn(
          "hidden h-full shrink-0 flex-col overflow-y-auto border-r border-border/60 bg-card md:flex",
          open ? "w-[var(--sidebar-w)] px-3 py-3" : "w-[72px] items-center py-2",
        )}
      >
        {open ? (
          <SidebarBody active={active} onNavigate={onNavigate} />
        ) : (
          <NavItems
            active={active}
            compact
            onNavigate={onNavigate}
            openAreaPicker={openAreaPicker}
            homeDistrict={homeDistrict}
            areaPickerOpen={areaPickerOpen}
          />
        )}
      </aside>

      <aside
        className={cn(
          "absolute inset-y-0 left-0 z-30 flex w-[min(var(--sidebar-w),85vw)] flex-col overflow-y-auto border-r border-border/60 bg-card px-3 py-3 shadow-2xl md:hidden",
          "transition-transform duration-200",
          open ? "translate-x-0" : "pointer-events-none -translate-x-full",
        )}
      >
        <SidebarBody active={active} onNavigate={onNavigate} />
      </aside>
    </>
  );
}
