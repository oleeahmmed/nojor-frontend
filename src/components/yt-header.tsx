"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Menu, Mic, Plus, Search } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { ThemeSwitcher } from "./theme-switcher";
import { NotificationsBell } from "./notifications-bell";
import { useIdentity } from "./identity-provider";
import { useStudioSession } from "@/hooks/use-studio-session";
import { HomeDistrictFilter } from "./home-district-filter";
import { SmartSearchPanel } from "./smart-search-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function YtHeader({
  onMenu,
  onProfile,
  onCreate,
}: {
  onMenu: () => void;
  onProfile: () => void;
  onCreate?: () => void;
}) {
  const { name } = useIdentity();
  const { loggedIn: studioOk, name: studioName, avatarUrl } = useStudioSession();
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [mobileSearch, setMobileSearch] = useState(false);
  const avatarLabel = studioOk
    ? studioName || "টিম"
    : name || "আপনার নাম দিন";
  const avatarLetter = studioOk
    ? (studioName || "ট").slice(0, 1)
    : (name || "ন").slice(0, 1);

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
    <header className="z-40 flex h-14 w-full shrink-0 items-center gap-1 border-b border-border/60 bg-background px-1.5 sm:h-16 sm:gap-1.5 sm:px-3">
      <div className="flex shrink-0 items-center gap-0">
        {/* Desktop/tablet sidebar toggle — mobile uses bottom “আরও” */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden size-10 rounded-full md:inline-flex md:size-9"
          onClick={onMenu}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <BrandLogo compact />
      </div>

      <form
        onSubmit={goSearch}
        className="mx-auto hidden min-w-0 max-w-[420px] flex-1 items-center justify-center gap-2 px-2 lg:flex"
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

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
        {/* Desktop create */}
        {onCreate ? (
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 rounded-full border-border px-3 md:inline-flex"
            onClick={onCreate}
          >
            <Plus className="h-4 w-4" />
            Create
          </Button>
        ) : null}

        {/* এলাকা + স্মার্ট সার্চ — md+ */}
        <div className="relative z-50 hidden min-w-0 items-center gap-1 overflow-visible md:flex sm:gap-1.5">
          <HomeDistrictFilter compact />
          <SmartSearchPanel inline />
        </div>

        <div className="hidden md:block">
          <ThemeSwitcher />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full lg:hidden sm:size-9"
          onClick={() => setMobileSearch(true)}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Button>

        <NotificationsBell />

        <button
          type="button"
          onClick={onProfile}
          className="mx-0.5 hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex sm:mx-0"
          title={avatarLabel}
        >
          <Avatar size="sm">
            {studioOk && avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="" />
            ) : null}
            <AvatarFallback className="bg-primary text-[11px] font-bold text-primary-foreground">
              {avatarLetter}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}
