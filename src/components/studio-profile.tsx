"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Camera, LogOut, Shield } from "lucide-react";
import {
  clearStudio,
  getStudioAvatar,
  mediaUrl,
  studioLogout,
  studioUpdateProfile,
} from "@/lib/studio";
import { COMMUNITY } from "@/lib/community";
import { useStudioSession } from "@/hooks/use-studio-session";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function useStudioProfile() {
  const { loggedIn, name, avatarUrl } = useStudioSession();
  const [open, setOpen] = useState(false);
  return {
    loggedIn,
    name,
    avatarUrl,
    open,
    setOpen,
    openProfile: () => setOpen(true),
  };
}

export function StudioProfileDialog({
  open,
  onOpenChange,
  name,
  avatarUrl = "",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
  avatarUrl?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [preview, setPreview] = useState(avatarUrl);
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const initial = (draftName || name || "ন").slice(0, 1);

  useEffect(() => {
    if (!open) return;
    setDraftName(name);
    setPreview(avatarUrl || getStudioAvatar());
    setFile(null);
    setErr("");
    setMsg("");
  }, [open, name, avatarUrl]);

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

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await studioUpdateProfile({
        name: draftName.trim(),
        avatar: file,
      });
      if (!res?.ok) {
        setErr(res?.error || "সেভ হয়নি।");
        return;
      }
      if (res.avatar_url) setPreview(mediaUrl(res.avatar_url));
      setMsg(res.message || "প্রোফাইল আপডেট হয়েছে।");
      setFile(null);
    } finally {
      setBusy(false);
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
            নাম ও ছবি আপডেট করুন — আপনার পোস্টে দেখা যাবে
          </DialogDescription>
        </div>
        <form onSubmit={onSave} className="px-5 py-4">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative"
              aria-label="অবতার বদলান"
            >
              <Avatar className="size-20">
                {preview ? (
                  <AvatarImage src={preview} alt="" />
                ) : null}
                <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition group-hover:opacity-100">
                <Camera className="h-5 w-5 text-white" />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setFile(f);
                setPreview(URL.createObjectURL(f));
              }}
            />
            <p className="text-[11px] text-muted-foreground">
              ছবিতে ট্যাপ করে নতুন অবতার দিন
            </p>
          </div>

          <label className="mt-4 block text-[13px] font-medium">
            প্রদর্শিত নাম
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              maxLength={80}
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              placeholder="আপনার নাম"
            />
          </label>

          {err ? (
            <p className="mt-2 text-[12px] text-destructive">{err}</p>
          ) : msg ? (
            <p className="mt-2 text-[12px] text-emerald-600 dark:text-emerald-400">
              {msg}
            </p>
          ) : (
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
              এই নাম ও ছবি ভিডিও কার্ড ও ওয়াচ পেজে দেখাবে। সরাতে{" "}
              <a
                href={`mailto:${COMMUNITY.team.email}`}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                {COMMUNITY.team.email}
              </a>
            </p>
          )}

          <div className="mt-4 flex flex-wrap justify-end gap-2">
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
              লগআউট
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="rounded-full"
            >
              {busy ? "সেভ…" : "সেভ করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
