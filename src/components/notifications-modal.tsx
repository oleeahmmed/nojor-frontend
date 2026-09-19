"use client";

import {
  BadgeCheck,
  Bell,
  FileWarning,
  Gavel,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Notif = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  kind: "case" | "official" | "moderation" | "system";
};

const DEMO_NOTIFS: Notif[] = [
  {
    id: "1",
    title: "নতুন কেস প্রকাশিত",
    body: "ঢাকা — ডেমো কেস আর্কাইভে যোগ হয়েছে।",
    time: "২ মিনিট আগে",
    unread: true,
    kind: "case",
  },
  {
    id: "2",
    title: "মডারেশন আপডেট",
    body: "আপনার জমা যাচাইয়ের অপেক্ষায় আছে।",
    time: "১ ঘণ্টা আগে",
    unread: true,
    kind: "moderation",
  },
  {
    id: "3",
    title: "কর্মকর্তা রিপোর্ট",
    body: "একটি অফিসিয়াল রিপোর্ট যাচাইয়ের পর টাইমলাইনে যোগ হয়েছে।",
    time: "গতকাল",
    kind: "official",
  },
  {
    id: "4",
    title: "নিরাপত্তা নোটিশ",
    body: "অজানা ডিভাইস থেকে লগইন চেষ্টা ধরা পড়েনি — সব ঠিক আছে।",
    time: "গতকাল",
    kind: "system",
  },
];

function iconFor(kind: Notif["kind"]) {
  if (kind === "case") return FileWarning;
  if (kind === "official") return BadgeCheck;
  if (kind === "moderation") return Gavel;
  return Shield;
}

export function NotificationsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const unread = DEMO_NOTIFS.filter((n) => n.unread).length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="gap-0 overflow-hidden border-0 p-0 sm:max-w-[420px]">
        <div className="border-b border-border/70 bg-card px-5 py-4 pr-12">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </span>
            <DialogHeader className="gap-0.5 text-left">
              <DialogTitle className="text-lg font-bold">
                Notifications
              </DialogTitle>
              <DialogDescription>
                {unread > 0
                  ? `${unread}টি নতুন আপডেট`
                  : "সব নোটিফিকেশন দেখা হয়েছে"}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <ScrollArea className="h-[min(52vh,420px)]">
          <ul className="divide-y divide-border/60">
            {DEMO_NOTIFS.map((n) => {
              const Icon = iconFor(n.kind);
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/60",
                      n.unread && "bg-primary/[0.04]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                        n.kind === "official"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : n.kind === "moderation"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                            : "bg-secondary text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold leading-snug">
                          {n.title}
                        </span>
                        {n.unread ? (
                          <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">
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
        </ScrollArea>

        <Separator />
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
            Mark all read
          </Button>
          <Button size="sm" className="rounded-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
