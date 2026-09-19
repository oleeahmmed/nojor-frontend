"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Home, MoreHorizontal, Plus, UserRound } from "lucide-react";
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
 * Small-screen bottom bar: Home · Create · Profile · More
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

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
      aria-label="মোবাইল নেভিগেশন"
    >
      <div className="mx-auto grid h-14 max-w-lg grid-cols-4 items-center px-1">
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium",
            homeOn ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <Home
            className="h-5 w-5"
            fill={homeOn ? "currentColor" : "none"}
            strokeWidth={homeOn ? 1.5 : 2}
          />
          হোম
        </Link>

        <button
          type="button"
          onClick={() => {
            if (onCreate) onCreate();
            else router.push("/?studio=1");
          }}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium text-muted-foreground"
          aria-label="Create"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-sm">
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </span>
          তৈরি
        </button>

        <button
          type="button"
          onClick={() => {
            if (role === "official") onOfficial();
            else openProfile();
          }}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium text-muted-foreground"
        >
          <UserRound className="h-5 w-5" />
          {name ? name.slice(0, 6) : "প্রোফাইল"}
        </button>

        <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
          <DropdownMenuTrigger
            className="flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium text-muted-foreground outline-none"
            aria-label="আরও"
          >
            <MoreHorizontal className="h-5 w-5" />
            আরও
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            className="mb-2 min-w-48"
          >
            <DropdownMenuItem onClick={onArea}>এলাকা</DropdownMenuItem>
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
