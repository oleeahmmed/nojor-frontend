"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, TrendingUp } from "lucide-react";
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
] as const;

function NavItems({
  active,
  compact,
  onNavigate,
}: {
  active: string;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const infoOn =
    pathname === "/about" ||
    pathname === "/verification" ||
    pathname === "/corrections";

  return (
    <>
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const on = active === item.key;
        if (compact) {
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex w-16 flex-col items-center gap-1 rounded-xl px-1 py-3 text-[10px] leading-tight text-foreground transition-colors",
                on ? "bg-muted font-medium" : "hover:bg-muted/70",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={on ? 2.4 : 1.9} />
              <span className="max-w-full truncate text-center leading-tight">
                {item.short}
              </span>
            </Link>
          );
        }
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex w-full items-center gap-5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
              on
                ? "bg-muted font-semibold text-foreground"
                : "font-normal text-foreground/90 hover:bg-muted/70",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={on ? 2.4 : 1.9} />
            {item.label}
          </Link>
        );
      })}

      {compact ? (
        <Link
          href="/about"
          className={cn(
            "flex w-16 flex-col items-center gap-1 rounded-xl px-1 py-3 text-[10px] leading-tight text-foreground transition-colors",
            infoOn ? "bg-muted font-medium" : "hover:bg-muted/70",
          )}
        >
          <Info className="h-5 w-5" strokeWidth={infoOn ? 2.4 : 1.9} />
          <span className="max-w-full truncate text-center leading-tight">
            তথ্য
          </span>
        </Link>
      ) : (
        <Link
          href="/about"
          onClick={onNavigate}
          className={cn(
            "flex w-full items-center gap-5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
            infoOn
              ? "bg-muted font-semibold text-foreground"
              : "font-normal text-foreground/90 hover:bg-muted/70",
          )}
        >
          <Info className="h-5 w-5 shrink-0" strokeWidth={infoOn ? 2.4 : 1.9} />
          আমাদের সম্পর্কে
        </Link>
      )}
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
  return (
    <>
      <nav className="space-y-0.5">
        <NavItems active={active} onNavigate={onNavigate} />
      </nav>
      <Separator className="my-3" />
      <p className="px-3 text-[11px] text-muted-foreground">© Nojor</p>
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
  onCreate?: () => void;
  onNavigate?: () => void;
}) {
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
          <NavItems active={active} compact onNavigate={onNavigate} />
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
