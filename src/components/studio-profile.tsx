"use client";

import { useState } from "react";
import { LogOut, Shield } from "lucide-react";
import { clearStudio, studioLogout } from "@/lib/studio";
import { useStudioSession } from "@/hooks/use-studio-session";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function useStudioProfile() {
  const { loggedIn, name } = useStudioSession();
  const [open, setOpen] = useState(false);
  return {
    loggedIn,
    name,
    open,
    setOpen,
    openProfile: () => setOpen(true),
  };
}

export function StudioProfileDialog({
  open,
  onOpenChange,
  name,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
}) {
  const [busy, setBusy] = useState(false);
  const initial = (name || "ন").slice(0, 1);

  async function onLogout() {
    setBusy(true);
    try {
      await studioLogout();
    } finally {
      clearStudio();
      setBusy(false);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        overlayClassName="bg-black/50 dark:bg-black/70 backdrop-blur-[3px]"
        className="w-[min(400px,calc(100vw-1.5rem))] gap-0 overflow-hidden rounded-2xl border-border p-0 shadow-2xl"
      >
        <div className="brand-gradient px-5 py-4 text-white">
          <DialogTitle className="flex items-center gap-2 text-[15px] font-semibold">
            <Shield className="h-4.5 w-4.5" />
            নজর টিম প্রোফাইল
          </DialogTitle>
          <DialogDescription className="mt-1 text-[12px] text-white/80">
            লগইন অ্যাকাউন্ট · ভিডিও পোস্ট ও এডিট করতে পারবেন
          </DialogDescription>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">
                {name || "টিম ইউজার"}
              </p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                স্টাফ অ্যাকাউন্ট · সরানো ইমেইলে
              </p>
            </div>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
            ভিডিও পোস্ট ও বিবরণ/সূত্র/আইনি আপডেট করতে পারবেন। সরাতে হলে{" "}
            <a
              href="mailto:tips.nojor@gmail.com"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              tips.nojor@gmail.com
            </a>
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
            >
              বন্ধ
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              className="rounded-full gap-1.5"
              onClick={() => void onLogout()}
            >
              <LogOut className="h-3.5 w-3.5" />
              {busy ? "…" : "লগআউট"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
