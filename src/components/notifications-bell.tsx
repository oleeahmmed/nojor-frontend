"use client";

import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Bell,
  FileWarning,
  Gavel,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Notif = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  kind: "case" | "update" | "moderation" | "system";
};

const DEMO_NOTIFS: Notif[] = [
  {
    id: "1",
    title: "নতুন কেস প্রকাশিত",
    body: "Case ID দিয়ে আর্কাইভে যোগ হয়েছে।",
    time: "২ মিনিট আগে",
    unread: true,
    kind: "case",
  },
  {
    id: "2",
    title: "মডারেশন আপডেট",
    body: "ইমেইল জমা যাচাইয়ের অপেক্ষায়।",
    time: "১ ঘণ্টা আগে",
    unread: true,
    kind: "moderation",
  },
  {
    id: "3",
    title: "স্ট্যাটাস আপডেট",
    body: "একটি কেসের আইনি অবস্থা ইমেইল যাচাইয়ের পর আপডেট হয়েছে।",
    time: "গতকাল",
    kind: "update",
  },
  {
    id: "4",
    title: "নিরাপত্তা নোটিশ",
    body: "সব ঠিক আছে — সন্দেহজনক লগইন ধরা পড়েনি।",
    time: "গতকাল",
    kind: "system",
  },
];

function iconFor(kind: Notif["kind"]) {
  if (kind === "case") return FileWarning;
  if (kind === "update") return BadgeCheck;
  if (kind === "moderation") return Gavel;
  return Shield;
}

/** YouTube-style notifications panel under the bell. */
export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(DEMO_NOTIFS);
  const rootRef = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => n.unread).length;

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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex size-10 items-center justify-center rounded-full text-foreground outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:size-9"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-[calc(100%+8px)] z-[90] flex w-[min(calc(100vw-1.5rem),22rem)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-popover text-popover-foreground shadow-2xl sm:w-[24rem]"
        >
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div>
              <p className="text-[15px] font-semibold">Notifications</p>
              <p className="text-[11px] text-muted-foreground">
                {unread > 0 ? `${unread}টি নতুন আপডেট` : "সব পড়া হয়েছে"}
              </p>
            </div>
          </div>
          <ul className="max-h-[min(70vh,28rem)] overflow-y-auto overscroll-contain py-1">
            {items.map((n) => {
              const Icon = iconFor(n.kind);
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full gap-3 px-3.5 py-3 text-left transition hover:bg-muted/70",
                      n.unread && "bg-primary/[0.04]",
                    )}
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((x) =>
                          x.id === n.id ? { ...x, unread: false } : x,
                        ),
                      )
                    }
                  >
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-[13px] font-semibold leading-snug">
                          {n.title}
                        </span>
                        {n.unread ? (
                          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                        {n.body}
                      </span>
                      <span className="mt-1 block text-[11px] text-muted-foreground/80">
                        {n.time}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between border-t border-border/60 px-3 py-2">
            <button
              type="button"
              className="rounded-full px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() =>
                setItems((prev) => prev.map((x) => ({ ...x, unread: false })))
              }
            >
              সব পড়া চিহ্নিত
            </button>
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-[12px] font-semibold hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              বন্ধ
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
