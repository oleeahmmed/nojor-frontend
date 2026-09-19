"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Bell, Menu, Mic, Plus, Search } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { ThemeSwitcher } from "./theme-switcher";
import { useIdentity } from "./identity-provider";
import { useApp } from "./providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function YtHeader({
  onMenu,
  onOfficial,
  onCreate,
  onNotifications,
}: {
  onMenu: () => void;
  onOfficial: () => void;
  onCreate: () => void;
  onNotifications: () => void;
}) {
  const { role } = useApp();
  const { name, openProfile } = useIdentity();
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [mobileSearch, setMobileSearch] = useState(false);

  useEffect(() => {
    setQ(params.get("q") || "");
  }, [params]);

  function goSearch(e?: FormEvent) {
    e?.preventDefault();
    const term = q.trim();
    router.push(term ? `/?q=${encodeURIComponent(term)}` : "/");
    setMobileSearch(false);
  }

  if (mobileSearch) {
    return (
      <header className="flex h-14 w-full shrink-0 items-center gap-2 border-b border-border/60 bg-background px-2 sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setMobileSearch(false)}
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <form onSubmit={goSearch} className="min-w-0 flex-1">
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="h-10 rounded-full"
          />
        </form>
      </header>
    );
  }

  return (
    <header className="z-40 flex h-12 w-full shrink-0 items-center gap-1 border-b border-border/60 bg-background px-1.5 sm:h-14 sm:gap-2 sm:px-3">
      <div className="flex shrink-0 items-center gap-0">
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full sm:size-9"
          onClick={onMenu}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <BrandLogo />
      </div>

      <form
        onSubmit={goSearch}
        className="mx-auto hidden min-w-0 max-w-[640px] flex-1 items-center justify-center gap-2 px-4 md:flex"
      >
        <div className="flex h-10 min-w-0 flex-1 overflow-hidden rounded-full border border-border bg-background focus-within:border-foreground/20">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-4 shadow-none focus-visible:ring-0"
          />
          <Button
            type="submit"
            variant="secondary"
            className="h-full w-14 shrink-0 rounded-none border-0 border-l border-border"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="shrink-0 rounded-full"
          aria-label="Voice"
        >
          <Mic className="h-4 w-4" />
        </Button>
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-0 sm:gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full md:hidden sm:size-9"
          onClick={() => setMobileSearch(true)}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden h-9 rounded-full border-border px-3 sm:inline-flex"
          onClick={onCreate}
        >
          <Plus className="h-4 w-4" />
          Create
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full sm:hidden"
          onClick={onCreate}
          aria-label="Create"
        >
          <Plus className="h-5 w-5" />
        </Button>

        <ThemeSwitcher />

        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full sm:size-9"
          onClick={onNotifications}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <button
          type="button"
          onClick={role === "official" ? onOfficial : openProfile}
          className="mx-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mx-0"
          title={
            role === "official"
              ? "কর্মকর্তা মোড"
              : name
                ? name
                : "আপনার নাম দিন"
          }
        >
          <Avatar size="sm">
            <AvatarFallback
              className={
                role === "official"
                  ? "bg-emerald-600 text-[11px] font-bold text-white"
                  : "bg-primary text-[11px] font-bold text-primary-foreground"
              }
            >
              {role === "official" ? "অ" : (name || "ন").slice(0, 1)}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}
