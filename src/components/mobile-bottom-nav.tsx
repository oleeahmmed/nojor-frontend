"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Compass,
  Home,
  MoreHorizontal,
  Plus,
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
 * YouTube-style mobile bar — icons only, no labels.
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
  const { openProfile } = useIdentity();
  const { role } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);

  const homeOn = pathname === "/" && !search.get("view");
  const profileOn = role === "official";

  const item =
    "flex h-full w-full items-center justify-center text-muted-foreground outline-none transition hover:text-foreground";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
      aria-label="মোবাইল নেভিগেশন"
    >
      <div className="mx-auto grid h-12 max-w-lg grid-cols-4 items-stretch">
        <Link
          href="/"
          aria-label="Home"
          className={cn(item, homeOn && "text-foreground")}
        >
          <Home
            className="h-6 w-6"
            strokeWidth={homeOn ? 2.25 : 1.75}
            fill={homeOn ? "currentColor" : "none"}
          />
        </Link>

        <button
          type="button"
          onClick={() => {
            if (onCreate) onCreate();
            else router.push("/?studio=1");
          }}
          className={item}
          aria-label="Create"
        >
          <Plus className="h-7 w-7" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={() => {
            if (role === "official") onOfficial();
            else openProfile();
          }}
          className={cn(item, profileOn && "text-foreground")}
          aria-label="Profile"
        >
          <UserRound className="h-6 w-6" strokeWidth={1.75} />
        </button>

        <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
          <DropdownMenuTrigger
            className={cn(item, moreOpen && "text-foreground")}
            aria-label="More"
          >
            <MoreHorizontal className="h-6 w-6" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            className="mb-2 min-w-52 overflow-hidden rounded-2xl border-border/60 shadow-xl"
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
    </nav>
  );
}
