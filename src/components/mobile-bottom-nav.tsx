"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CirclePlus,
  Compass,
  Home,
  MoreHorizontal,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useIdentity } from "./identity-provider";
import { useApp } from "./providers";
import { ThemeSwitcher } from "./theme-switcher";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Premium floating bottom dock — Home · Create · Profile · More
 */
export function MobileBottomNav({
  onCreate,
  onOfficial,
  onArea,
}: {
  onCreate?: () => void;
  onOfficial: () => void;
  onArea: () => void;
}) {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const { name, openProfile } = useIdentity();
  const { role } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);

  const homeOn = pathname === "/" && !search.get("view");
  const profileOn = role === "official";

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      aria-label="মোবাইল নেভিগেশন"
    >
      <div className="pointer-events-auto mx-auto w-[min(100%-1.25rem,22rem)]">
        <div
          className={cn(
            "relative grid h-[3.65rem] grid-cols-4 items-end rounded-[1.35rem] px-1.5 pb-1.5 pt-1",
            "border border-white/10 bg-background/75 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)]",
            "backdrop-blur-xl supports-[backdrop-filter]:bg-background/55",
            "dark:border-white/12 dark:bg-zinc-950/70 dark:shadow-[0_16px_48px_-10px_rgba(0,0,0,0.75)]",
          )}
        >
          {/* soft top highlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent dark:via-white/20"
          />

          <Link
            href="/"
            className={cn(
              "group flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-semibold tracking-wide transition",
              homeOn
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-2xl transition",
                homeOn
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-transparent group-hover:bg-muted/70",
              )}
            >
              <Home
                className="h-[1.15rem] w-[1.15rem]"
                strokeWidth={homeOn ? 2.25 : 1.85}
                fill={homeOn ? "currentColor" : "none"}
              />
            </span>
            হোম
          </Link>

          <button
            type="button"
            onClick={() => {
              if (onCreate) onCreate();
              else router.push("/?studio=1");
            }}
            className="group relative -mt-5 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground"
            aria-label="Create"
          >
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-full",
                "bg-gradient-to-b from-red-500 to-red-700 text-white",
                "shadow-[0_8px_20px_-4px_rgba(220,38,38,0.55)]",
                "ring-4 ring-background transition group-active:scale-95",
              )}
            >
              <CirclePlus className="h-6 w-6" strokeWidth={2} />
            </span>
            <span className="mt-0.5">তৈরি</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (role === "official") onOfficial();
              else openProfile();
            }}
            className={cn(
              "group flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-semibold tracking-wide transition",
              profileOn
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-2xl transition",
                profileOn
                  ? "bg-foreground/10 text-foreground"
                  : "group-hover:bg-muted/70",
              )}
            >
              <UserRound className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.85} />
            </span>
            {name ? name.slice(0, 6) : "প্রোফাইল"}
          </button>

          <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
            <DropdownMenuTrigger
              className={cn(
                "group flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-semibold tracking-wide outline-none transition",
                moreOpen
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="আরও"
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-2xl transition",
                  moreOpen
                    ? "bg-foreground/10"
                    : "group-hover:bg-muted/70",
                )}
              >
                <MoreHorizontal
                  className="h-[1.15rem] w-[1.15rem]"
                  strokeWidth={1.85}
                />
              </span>
              আরও
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              className="mb-3 min-w-52 overflow-hidden rounded-2xl border-border/60 shadow-xl"
            >
              <DropdownMenuItem onClick={onArea} className="gap-2">
                <Compass className="h-4 w-4 opacity-70" />
                এলাকা
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOfficial}>
                কর্মকর্তা প্রবেশ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/about")}>
                আমাদের সম্পর্কে
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/verification")}>
                কীভাবে যাচাই হয়
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/corrections")}>
                সংশোধন নীতি
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm">থিম</span>
                <ThemeSwitcher />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
