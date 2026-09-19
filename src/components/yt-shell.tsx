"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { YtHeader } from "./yt-header";
import { YtSidebar } from "./yt-sidebar";
import { OfficialModal } from "./official-modal";
import { CreateModal } from "./create-modal";
import { NotificationsModal } from "./notifications-modal";
import { AreaPickerModal } from "./area-picker-modal";
import { useApp } from "./providers";
import { useStudioSession } from "@/hooks/use-studio-session";

export function YtShell({
  children,
  collapseSidebar = false,
}: {
  children: ReactNode;
  /** Watch page: no mini-rail — hamburger opens overlay like YouTube */
  collapseSidebar?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [officialOpen, setOfficialOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const search = useSearchParams();
  const router = useRouter();
  const { areaPickerOpen, openAreaPicker, closeAreaPicker } = useApp();
  const studioOk = useStudioSession();
  const view = search.get("view");
  const active = view || "home";

  useEffect(() => {
    if (view !== "area") return;
    openAreaPicker();
    router.replace("/");
  }, [view, openAreaPicker, router]);

  useEffect(() => {
    if (collapseSidebar) {
      setMenuOpen(false);
      return;
    }
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setMenuOpen(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [collapseSidebar]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function closeAfterNav() {
    if (collapseSidebar || window.matchMedia("(max-width: 767px)").matches) {
      setMenuOpen(false);
    }
  }

  const openCreate = studioOk
    ? () => {
        setCreateOpen(true);
      }
    : undefined;

  return (
    <div className="fixed inset-0 z-0 flex h-[100dvh] w-full max-w-none flex-col overflow-hidden bg-background text-foreground">
      <YtHeader
        onMenu={() => setMenuOpen((v) => !v)}
        onOfficial={() => setOfficialOpen(true)}
        onCreate={openCreate}
        onNotifications={() => setNotifsOpen(true)}
      />

      <div className="relative flex min-h-0 min-w-0 flex-1">
        {menuOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            className={
              collapseSidebar
                ? "absolute inset-0 z-[25] bg-black/40"
                : "absolute inset-0 z-[25] bg-black/40 md:hidden"
            }
            onClick={closeMenu}
          />
        ) : null}

        <YtSidebar
          open={menuOpen}
          mode={collapseSidebar ? "overlay" : "dock"}
          active={active}
          onOfficial={() => {
            setOfficialOpen(true);
            closeAfterNav();
          }}
          onCreate={
            openCreate
              ? () => {
                  openCreate();
                  closeAfterNav();
                }
              : undefined
          }
          onNavigate={closeAfterNav}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-background">
          {children}
        </main>
      </div>

      <OfficialModal open={officialOpen} onClose={() => setOfficialOpen(false)} />
      {studioOk ? (
        <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
      ) : null}
      <NotificationsModal open={notifsOpen} onClose={() => setNotifsOpen(false)} />
      <AreaPickerModal open={areaPickerOpen} onClose={closeAreaPicker} />
    </div>
  );
}
