"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  type SelectHTMLAttributes,
} from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  CloudUpload,
  ExternalLink,
  FileVideo,
  ImagePlus,
  Link2,
  Lock,
  LogOut,
  MapPin,
  Tag,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { submitCase } from "@/lib/api";
import { COMMUNITY } from "@/lib/community";
import { CRIME_CATEGORIES } from "@/lib/categories";
import { ACCUSED_PARTIES, type AccusedPartyKey } from "@/lib/parties";
import { captureVideoFrame } from "@/lib/thumbnails";
import {
  clearStudio,
  getStudioName,
  getStudioToken,
  studioLogin,
  studioLogout,
  studioMe,
  uploadVideo,
  staffEditCase,
} from "@/lib/studio";
import {
  LocationFields,
  EMPTY_LOCATION,
  type LocationValue,
} from "./location-fields";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const field =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15";
const label = "mb-1.5 block text-[13px] font-medium text-foreground";
const selectField = cn(field, "appearance-none pr-10");

function FormSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative w-full min-w-0">
      <select {...props} className={cn(selectField, className)}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

function formatBytes(n: number) {
  if (n >= 1024 * 1024 * 1024) return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}

type Tab = "link" | "upload";

/** YouTube-style upload wizard steps */
const WIZARD_STEPS = [
  { key: "details", label: "বিবরণ", optional: false },
  { key: "category", label: "ক্যাটাগরি", optional: true },
  { key: "area", label: "এলাকা", optional: false },
  { key: "publish", label: "প্রকাশ", optional: false },
] as const;

export function CreateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("link");
  const [ok, setOk] = useState(false);
  const [okSlug, setOkSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // shared fields
  const [sourceUrl, setSourceUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [party, setParty] = useState<AccusedPartyKey>("");
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);

  // studio (team) state
  const [staffName, setStaffName] = useState("");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState("");
  const [thumbBusy, setThumbBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [uploadPct, setUploadPct] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const cached = getStudioName();
    if (cached && getStudioToken()) {
      setStaffName(cached);
      studioMe().then((r) => {
        if (!r.ok) setStaffName("");
      });
    } else {
      // Open on team-login tab so admin/staff can sign in quickly
      setTab("upload");
    }
  }, [open]);

  function reset() {
    setTab("link");
    setOk(false);
    setOkSlug("");
    setError("");
    setLoading(false);
    setHelpOpen(false);
    setMoreOpen(false);
    setSourceUrl("");
    setTitle("");
    setDescription("");
    setCategory("");
    setParty("");
    setLocation(EMPTY_LOCATION);
    setLoginUser("");
    setLoginPass("");
    setFile(null);
    setThumbFile(null);
    setThumbPreview("");
    setThumbBusy(false);
    setStep(0);
    setUploadPct(0);
    setDragOver(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      if (loading) return; // আপলোড চলাকালীন বন্ধ নয়
      onClose();
      window.setTimeout(reset, 220);
    }
  }

  function switchTab(next: Tab) {
    setTab(next);
    setError("");
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass) {
      setError("ইউজারনেম ও পাসওয়ার্ড দিন।");
      return;
    }
    setLoginBusy(true);
    setError("");
    const res = await studioLogin(loginUser.trim(), loginPass);
    setLoginBusy(false);
    if (res.ok) {
      setStaffName(res.name || loginUser.trim());
      setLoginPass("");
    } else {
      setError(res.error || "লগইন ব্যর্থ।");
    }
  }

  async function onLogout() {
    await studioLogout();
    setStaffName("");
    setFile(null);
    setStep(0);
    setError("");
  }

  async function applyAutoThumb(video: File) {
    setThumbBusy(true);
    const blob = await captureVideoFrame(video, 1);
    setThumbBusy(false);
    if (!blob) return;
    const auto = new File([blob], "auto-thumb.jpg", { type: "image/jpeg" });
    setThumbFile(auto);
    setThumbPreview(URL.createObjectURL(blob));
  }

  function pickFile(f: File | null | undefined) {
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setError("শুধু ভিডিও ফাইল গ্রহণযোগ্য।");
      return;
    }
    if (f.size > 512 * 1024 * 1024) {
      setError("ভিডিও সর্বোচ্চ 512MB।");
      return;
    }
    setError("");
    setFile(f);
    setStep(0);
    if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    setThumbFile(null);
    setThumbPreview("");
    void applyAutoThumb(f);
  }

  function pickThumb(f: File | null | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("থাম্বনেইল শুধু ছবি হতে হবে (JPG/PNG/WebP)।");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      setError("থাম্বনেইল সর্বোচ্চ ৮MB।");
      return;
    }
    setError("");
    if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    setThumbFile(f);
    setThumbPreview(URL.createObjectURL(f));
  }

  function removeFile() {
    setFile(null);
    setStep(0);
    setError("");
    if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    setThumbFile(null);
    setThumbPreview("");
  }

  /** step এগোনোর আগে required ঘর যাচাই */
  function validateStep(s: number): string {
    if (s === 0 && !title.trim()) return "শিরোনাম বাধ্যতামূলক।";
    if (s === 2 && !location.district.trim()) return "জেলা বাধ্যতামূলক।";
    return "";
  }

  function goNext() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  function goToStep(target: number) {
    if (target >= step) return; // শুধু পেছনের ধাপে ক্লিক
    setError("");
    setStep(target);
  }

  async function onSubmitLink(e: FormEvent) {
    e.preventDefault();
    if (!sourceUrl.trim()) {
      setError("ভিডিও লিংক বাধ্যতামূলক।");
      return;
    }
    if (!/youtube\.com|youtu\.be|facebook\.com|fb\.watch/i.test(sourceUrl)) {
      setError("শুধু YouTube বা Facebook লিংক গ্রহণযোগ্য।");
      return;
    }
    if (!title.trim()) {
      setError("শিরোনাম বাধ্যতামূলক।");
      return;
    }
    if (!location.district.trim()) {
      setError("জেলা বাধ্যতামূলক।");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await submitCase({
        title: title.trim(),
        source_url: sourceUrl.trim(),
        description: description.trim(),
        division: location.division,
        district: location.district,
        upazila: location.upazila,
        thana: location.thana,
        village: location.village,
        crime_category: category,
        accused_party: party || undefined,
      });
      if (res?.ok) setOk(true);
      else setError(res?.error || "জমা ব্যর্থ হয়েছে।");
    } catch {
      setError("নেটওয়ার্ক ত্রুটি — আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  async function publishUpload() {
    if (!file) {
      setError("একটি ভিডিও ফাইল বাছুন।");
      return;
    }
    setLoading(true);
    setUploadPct(0);
    setError("");
    const res = await uploadVideo(
      {
        video: file,
        title: title.trim(),
        district: location.district,
        summary: description.trim(),
        division: location.division,
        upazila: location.upazila,
        thana: location.thana,
        village: location.village,
        crime_category: category,
        thumbnail: thumbFile,
      },
      setUploadPct,
    );
    setLoading(false);
    if (res.ok) {
      if (res.slug && party) {
        try {
          await staffEditCase(res.slug, { accused_party: party });
        } catch {
          /* party optional — video already published */
        }
      }
      setOkSlug(res.slug || "");
      setOk(true);
    } else {
      setError(res.error || "আপলোড ব্যর্থ হয়েছে।");
      if (res.error === "লগইন প্রয়োজন।") {
        clearStudio();
        setStaffName("");
      }
    }
  }

  /** Enter চাপলে wizard এগোয়, শেষ ধাপে প্রকাশ হয় */
  function onSubmitUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      fileInputRef.current?.click();
      return;
    }
    if (step < WIZARD_STEPS.length - 1) goNext();
    else void publishUpload();
  }

  const isUploadTab = tab === "upload";
  const loggedIn = Boolean(staffName);
  const lastStep = step === WIZARD_STEPS.length - 1;
  const categoryLabel =
    CRIME_CATEGORIES.find((c) => c.key === category)?.label || "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/55 dark:bg-black/75 backdrop-blur-[3px]"
        className={cn(
          /* Mobile: bottom sheet slightly raised · Desktop: centered */
          "flex flex-col gap-0 overflow-hidden border-border bg-card p-0 text-card-foreground shadow-2xl ring-0",
          "fixed inset-x-2 bottom-[max(0.85rem,env(safe-area-inset-bottom))] top-auto max-h-[min(90dvh,920px)] w-auto max-w-none translate-x-0 translate-y-0 rounded-2xl",
          "data-open:slide-in-from-bottom-4 data-closed:slide-out-to-bottom-4",
          "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:bottom-auto sm:max-h-[min(88dvh,780px)]",
          "sm:w-[min(560px,calc(100vw-1.5rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
          "sm:data-open:zoom-in-95 sm:data-closed:zoom-out-95 sm:data-open:slide-in-from-bottom-0",
          "md:w-[min(720px,calc(100vw-2rem))]",
        )}
      >
        <DialogTitle className="sr-only">ভিডিও জমা / আপলোড</DialogTitle>
        <DialogDescription className="sr-only">
          লিংক দিয়ে জমা দিন বা টিম হিসেবে সরাসরি ভিডিও আপলোড করুন
        </DialogDescription>

        {/* Drag hint (mobile) */}
        <div aria-hidden className="flex justify-center pt-2.5 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <header className="shrink-0 border-b border-border/70 px-4 pt-1 sm:px-5 sm:pt-4">
          <div className="flex items-center gap-3">
            <span className="brand-gradient flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
              <Upload className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold tracking-tight sm:text-[17px]">
                {isUploadTab ? "ভিডিও আপলোড" : "ভিডিও জমা দিন"}
              </h2>
              <p className="truncate text-[12px] text-muted-foreground">
                {isUploadTab
                  ? loggedIn
                    ? `টিম অ্যাকাউন্ট · ${staffName}`
                    : "শুধু নজর টিমের জন্য"
                  : "পাবলিক লিংক · যাচাইয়ের পর প্রকাশ"}
              </p>
            </div>
            {isUploadTab && loggedIn && !loading ? (
              <button
                type="button"
                onClick={onLogout}
                className="flex h-8 items-center gap-1.5 rounded-full border border-border px-2.5 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" /> লগআউট
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="বন্ধ"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-3 flex gap-1 pb-0">
            <button
              type="button"
              onClick={() => switchTab("link")}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-t-lg border-b-2 px-3.5 text-[13px] font-medium transition",
                !isUploadTab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Link2 className="h-3.5 w-3.5" /> লিংক জমা
            </button>
            <button
              type="button"
              onClick={() => switchTab("upload")}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-t-lg border-b-2 px-3.5 text-[13px] font-medium transition",
                isUploadTab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <CloudUpload className="h-3.5 w-3.5" /> ফাইল আপলোড
              <span className="rounded-full bg-muted px-1.5 py-px text-[10px] font-semibold text-muted-foreground">
                টিম
              </span>
            </button>
          </div>
        </header>

        {ok ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <CheckCircle2
              className="mb-4 h-14 w-14 text-primary"
              strokeWidth={1.5}
            />
            <p className="text-lg font-semibold tracking-tight">
              {okSlug ? "ভিডিও প্রকাশিত হয়েছে" : "জমা সম্পন্ন"}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {okSlug
                ? "ভিডিও এখন আর্কাইভে লাইভ।"
                : "কেস প্রকাশিত হয়েছে। Admin → Cases এ দেখা যাবে।"}
            </p>
            <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
              {okSlug ? (
                <Link
                  href={`/cases/${okSlug}`}
                  onClick={() => handleOpenChange(false)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  ভিডিও দেখুন
                </Link>
              ) : null}
              <Button
                type="button"
                variant={okSlug ? "outline" : "default"}
                className="h-11 w-full rounded-full"
                onClick={() => handleOpenChange(false)}
              >
                ঠিক আছে
              </Button>
            </div>
          </div>
        ) : isUploadTab && !loggedIn ? (
          /* ── Team login ── */
          <form onSubmit={onLogin} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-5">
              <div className="mx-auto w-full max-w-sm">
                <div className="mb-5 flex flex-col items-center text-center">
                  <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Lock className="h-5 w-5" />
                  </span>
                  <p className="text-[15px] font-semibold">টিম লগইন</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    সরাসরি ভিডিও আপলোড শুধু নজর টিমের অনুমোদিত অ্যাকাউন্ট থেকে
                    করা যায়।
                  </p>
                </div>
                <div className="space-y-3.5">
                  <div>
                    <label className={label}>ইউজারনেম</label>
                    <input
                      value={loginUser}
                      onChange={(e) => setLoginUser(e.target.value)}
                      autoComplete="username"
                      className={field}
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className={label}>পাসওয়ার্ড</label>
                    <input
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      type="password"
                      autoComplete="current-password"
                      className={field}
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>
                {error ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-[13px] text-destructive"
                  >
                    {error}
                  </p>
                ) : null}
              </div>
            </div>
            <footer className="shrink-0 border-t border-border/70 bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
              <Button
                type="submit"
                disabled={loginBusy}
                className="h-11 w-full rounded-full text-[15px] font-semibold"
              >
                {loginBusy ? "যাচাই হচ্ছে…" : "লগইন"}
              </Button>
              <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
                সাধারণ দর্শক?{" "}
                <button
                  type="button"
                  onClick={() => switchTab("link")}
                  className="font-medium text-foreground/80 underline-offset-2 hover:underline"
                >
                  লিংক দিয়ে জমা দিন
                </button>
              </p>
            </footer>
          </form>
        ) : isUploadTab ? (
          /* ══ YouTube-style multi-step upload wizard ══ */
          <form onSubmit={onSubmitUpload} className="flex min-h-0 flex-1 flex-col">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />

            {!file ? (
              /* ── Step 0: select file (YouTube upload landing) ── */
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    pickFile(e.dataTransfer.files?.[0]);
                  }}
                  className="flex flex-col items-center gap-1 text-center"
                >
                  <span
                    className={cn(
                      "mb-4 flex size-24 items-center justify-center rounded-full transition sm:size-28",
                      dragOver
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <CloudUpload className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.5} />
                  </span>
                  <p className="text-[15px] font-medium">
                    ভিডিও ফাইল টেনে এনে ছাড়ুন
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    প্রকাশের আগ পর্যন্ত ভিডিও প্রাইভেট থাকবে
                  </p>
                </button>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 h-10 rounded-full px-6 text-[13px] font-semibold"
                >
                  ফাইল বাছুন
                </Button>
                <p className="mt-4 text-[11px] text-muted-foreground">
                  MP4 · WebM · MOV — সর্বোচ্চ 512MB
                </p>
                {error ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-[13px] text-destructive"
                  >
                    {error}
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                {/* ── Stepper (YouTube-style) ── */}
                <div className="shrink-0 border-b border-border/60 bg-muted/30 px-4 py-3 sm:px-6">
                  <div className="mx-auto flex max-w-md items-center">
                    {WIZARD_STEPS.map((s, i) => {
                      const done = i < step;
                      const current = i === step;
                      return (
                        <div
                          key={s.key}
                          className={cn(
                            "flex items-center",
                            i > 0 && "min-w-0 flex-1",
                          )}
                        >
                          {i > 0 ? (
                            <div
                              className={cn(
                                "mx-1.5 h-px flex-1 sm:mx-2",
                                done || current
                                  ? "bg-primary/60"
                                  : "bg-border",
                              )}
                            />
                          ) : null}
                          <button
                            type="button"
                            onClick={() => goToStep(i)}
                            disabled={i >= step}
                            className={cn(
                              "flex shrink-0 flex-col items-center gap-1",
                              i < step && "cursor-pointer",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-6 items-center justify-center rounded-full text-[11px] font-bold transition sm:size-7 sm:text-[12px]",
                                done
                                  ? "brand-gradient text-white"
                                  : current
                                    ? "bg-primary/15 text-primary ring-2 ring-primary"
                                    : "bg-muted text-muted-foreground ring-1 ring-border",
                              )}
                            >
                              {done ? (
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                              ) : (
                                i + 1
                              )}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-medium sm:text-[11px]",
                                current
                                  ? "text-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              {s.label}
                              {s.optional ? (
                                <span className="text-muted-foreground/60">
                                  {" "}
                                  (ঐচ্ছিক)
                                </span>
                              ) : null}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
                  {/* File chip — সব ধাপে দৃশ্যমান */}
                  <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileVideo className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                    {!loading ? (
                      <button
                        type="button"
                        onClick={removeFile}
                        className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="ফাইল বাদ দিন"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  {step === 0 ? (
                    /* ── ধাপ ১: বিবরণ + থাম্বনেইল ── */
                    <div className="space-y-3.5">
                      <div>
                        <label className={label}>
                          থাম্বনেইল{" "}
                          <span className="font-normal text-muted-foreground">
                            (ঐচ্ছিক — অটো ফ্রেম বা কাস্টম ছবি)
                          </span>
                        </label>
                        <input
                          ref={thumbInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={(e) => pickThumb(e.target.files?.[0])}
                        />
                        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-start">
                          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-player ring-1 ring-border sm:max-w-[240px]">
                            {thumbPreview ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={thumbPreview}
                                alt="থাম্বনেইল প্রিভিউ"
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
                                <ImagePlus className="h-6 w-6 opacity-60" />
                                <span className="text-[11px]">
                                  {thumbBusy ? "ফ্রেম নেওয়া হচ্ছে…" : "কভার নেই"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              disabled={thumbBusy || !file}
                              onClick={() => file && void applyAutoThumb(file)}
                            >
                              অটো ফ্রেম
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={() => thumbInputRef.current?.click()}
                            >
                              ছবি বাছুন
                            </Button>
                            {thumbPreview ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-muted-foreground"
                                onClick={() => {
                                  if (thumbPreview) URL.revokeObjectURL(thumbPreview);
                                  setThumbFile(null);
                                  setThumbPreview("");
                                }}
                              >
                                সরান
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className={label}>
                          শিরোনাম <span className="text-destructive">*</span>
                        </label>
                        <input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="ঘটনার সংক্ষিপ্ত শিরোনাম"
                          className={field}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className={label}>
                          বিবরণ{" "}
                          <span className="font-normal text-muted-foreground">
                            (ঐচ্ছিক)
                          </span>
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="কী ঘটেছে, কবে, কারা জড়িত…"
                          rows={4}
                          className={cn(field, "h-auto resize-none py-2.5")}
                        />
                      </div>
                    </div>
                  ) : step === 1 ? (
                    /* ── ধাপ ২: ক্যাটাগরি (ঐচ্ছিক) ── */
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-[13px] font-medium">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        অপরাধের ধরন
                        <span className="font-normal text-muted-foreground">
                          — না জানলে এড়িয়ে যান
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {CRIME_CATEGORIES.filter((c) => c.key !== "all").map(
                          (c) => {
                            const on = category === c.key;
                            return (
                              <button
                                key={c.key}
                                type="button"
                                onClick={() =>
                                  setCategory(on ? "" : c.key)
                                }
                                className={cn(
                                  "h-9 rounded-full border px-3.5 text-[12.5px] font-medium transition",
                                  on
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/60",
                                )}
                              >
                                {c.label}
                              </button>
                            );
                          },
                        )}
                      </div>
                      <div className="mt-5 mb-3 flex items-center gap-2 text-[13px] font-medium">
                        কোন দলের বিরুদ্ধে অভিযোগ
                        <span className="font-normal text-muted-foreground">
                          — ঐচ্ছিক
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ACCUSED_PARTIES.filter((p) => p.key !== "").map(
                          (p) => {
                            const on = party === p.key;
                            return (
                              <button
                                key={p.key}
                                type="button"
                                onClick={() =>
                                  setParty(on ? "" : (p.key as AccusedPartyKey))
                                }
                                className={cn(
                                  "h-9 rounded-full border px-3.5 text-[12.5px] font-medium transition",
                                  on
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/60",
                                )}
                              >
                                {p.label}
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>
                  ) : step === 2 ? (
                    /* ── ধাপ ৩: এলাকা ── */
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-[13px] font-medium">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        ঘটনাস্থল
                        <span className="font-normal text-muted-foreground">
                          — জেলা বাধ্যতামূলক, বাকিগুলো ঐচ্ছিক
                        </span>
                      </div>
                      <div className="rounded-xl border border-border/80 bg-muted/30 p-3 sm:p-4">
                        <LocationFields
                          compact
                          value={location}
                          onChange={setLocation}
                        />
                      </div>
                    </div>
                  ) : (
                    /* ── ধাপ ৪: রিভিউ ও প্রকাশ ── */
                    <div className="space-y-3">
                      <ReviewRow
                        k="থাম্বনেইল"
                        v={thumbFile ? "কাস্টম / অটো সেট" : "ডিফল্ট"}
                        muted={!thumbFile}
                      />
                      <ReviewRow k="শিরোনাম" v={title.trim() || "—"} />
                      <ReviewRow
                        k="ক্যাটাগরি"
                        v={categoryLabel || "দেওয়া হয়নি"}
                        muted={!categoryLabel}
                      />
                      <ReviewRow
                        k="অভিযুক্ত দল"
                        v={
                          ACCUSED_PARTIES.find((p) => p.key === party)?.label ||
                          "প্রযোজ্য নয়"
                        }
                        muted={!party}
                      />
                      <ReviewRow
                        k="এলাকা"
                        v={
                          [
                            location.village,
                            location.thana,
                            location.upazila,
                            location.district,
                            location.division,
                          ]
                            .filter(Boolean)
                            .join(", ") || "—"
                        }
                      />
                      <ReviewRow
                        k="বিবরণ"
                        v={description.trim() || "দেওয়া হয়নি"}
                        muted={!description.trim()}
                      />

                      {loading ? (
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>আপলোড হচ্ছে — বন্ধ করবেন না…</span>
                            <span className="font-medium text-foreground">
                              {uploadPct}%
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-200"
                              style={{ width: `${uploadPct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="rounded-xl bg-muted/60 px-3.5 py-2.5 text-[12px] leading-relaxed text-muted-foreground">
                          প্রকাশ করলে ভিডিওটি সাথে সাথে আর্কাইভে লাইভ হবে।
                        </p>
                      )}
                    </div>
                  )}

                  {error ? (
                    <p
                      role="alert"
                      className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-[13px] text-destructive"
                    >
                      {error}
                    </p>
                  ) : null}
                </div>

                {/* ── Wizard footer ── */}
                <footer className="flex shrink-0 items-center gap-2 border-t border-border/70 bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
                  {step > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={loading}
                      onClick={goBack}
                      className="h-10 rounded-full px-4 text-[13px]"
                    >
                      <ChevronLeft className="mr-0.5 h-4 w-4" /> পেছনে
                    </Button>
                  ) : null}
                  <div className="flex-1" />
                  {WIZARD_STEPS[step].optional ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setCategory("");
                        goNext();
                      }}
                      className="h-10 rounded-full px-4 text-[13px] text-muted-foreground"
                    >
                      এড়িয়ে যান
                    </Button>
                  ) : null}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="brand-gradient h-10 rounded-full border-0 px-6 text-[13.5px] font-semibold text-white shadow-sm transition hover:opacity-90"
                  >
                    {lastStep
                      ? loading
                        ? `আপলোড হচ্ছে… ${uploadPct}%`
                        : "প্রকাশ করুন"
                      : "পরবর্তী"}
                  </Button>
                </footer>
              </>
            )}
          </form>
        ) : (
          /* ── Public link submit ── */
          <form onSubmit={onSubmitLink} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
              {/* Compact community row */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <a
                  href={COMMUNITY.facebookGroup.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[12px] font-medium transition hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#1877F2] text-[10px] font-bold text-white">
                    f
                  </span>
                  Facebook
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
                <a
                  href={COMMUNITY.youtube.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[12px] font-medium transition hover:border-red-500/40 hover:bg-red-500/5"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                    YT
                  </span>
                  YouTube
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
                <button
                  type="button"
                  onClick={() => setHelpOpen((v) => !v)}
                  className="inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  সাহায্য
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition",
                      helpOpen && "rotate-180",
                    )}
                  />
                </button>
              </div>

              {helpOpen ? (
                <div className="mb-4 rounded-xl bg-muted/60 px-3.5 py-3 text-[12px] leading-relaxed text-muted-foreground">
                  <p>
                    আগে Facebook গ্রুপ বা YouTube-এ পাবলিক ভিডিও পোস্ট করুন,
                    তারপর লিংক এখানে পেস্ট করুন।
                  </p>
                  <p className="mt-2">
                    টেস্ট:{" "}
                    <button
                      type="button"
                      className="font-medium text-foreground underline-offset-2 hover:underline"
                      onClick={() => setSourceUrl(COMMUNITY.sampleLinks.youtube)}
                    >
                      YouTube
                    </button>
                    {" · "}
                    <button
                      type="button"
                      className="font-medium text-foreground underline-offset-2 hover:underline"
                      onClick={() =>
                        setSourceUrl(COMMUNITY.sampleLinks.facebook)
                      }
                    >
                      Facebook
                    </button>
                  </p>
                </div>
              ) : null}

              <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-5 md:space-y-0">
                <div className="min-w-0 space-y-3.5">
                  <div>
                    <label className={label}>
                      ভিডিও লিংক <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        required
                        inputMode="url"
                        autoComplete="url"
                        placeholder="youtube.com / facebook.com লিংক"
                        className={cn(field, "pl-9")}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className={label}>
                      শিরোনাম <span className="text-destructive">*</span>
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="ঘটনার সংক্ষিপ্ত শিরোনাম"
                      className={field}
                    />
                  </div>

                  <div>
                    <label className={label}>অপরাধের ধরন</label>
                    <FormSelect
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">ঐচ্ছিক — বাছুন</option>
                      {CRIME_CATEGORIES.filter((c) => c.key !== "all").map(
                        (c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ),
                      )}
                    </FormSelect>
                  </div>

                  <div>
                    <label className={label}>কোন দলের বিরুদ্ধে অভিযোগ</label>
                    <FormSelect
                      value={party}
                      onChange={(e) =>
                        setParty(e.target.value as AccusedPartyKey)
                      }
                    >
                      {ACCUSED_PARTIES.map((p) => (
                        <option key={p.key || "none"} value={p.key}>
                          {p.label}
                        </option>
                      ))}
                    </FormSelect>
                  </div>

                  <div className="md:hidden">
                    <button
                      type="button"
                      onClick={() => setMoreOpen((v) => !v)}
                      className="flex w-full items-center justify-between rounded-xl border border-dashed border-border px-3 py-2.5 text-left text-[13px] text-muted-foreground hover:bg-muted/40"
                    >
                      বিবরণ (ঐচ্ছিক)
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition",
                          moreOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {moreOpen ? (
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="কী ঘটেছে, কবে…"
                        rows={3}
                        className={cn(field, "mt-2 h-auto resize-none py-2.5")}
                      />
                    ) : null}
                  </div>

                  <div className="hidden md:block">
                    <label className={label}>বিবরণ (ঐচ্ছিক)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="কী ঘটেছে, কবে…"
                      rows={3}
                      className={cn(field, "h-auto resize-none py-2.5")}
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="mb-2 text-[13px] font-medium">
                    এলাকা <span className="text-destructive">*</span>
                    <span className="ml-1 font-normal text-muted-foreground">
                      জেলা বাধ্যতামূলক
                    </span>
                  </p>
                  <div className="w-full min-w-0 rounded-xl border border-border/80 bg-muted/30 p-3 sm:p-3.5">
                    <LocationFields
                      compact
                      value={location}
                      onChange={setLocation}
                    />
                  </div>
                </div>
              </div>

              {error ? (
                <p
                  role="alert"
                  className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-[13px] text-destructive"
                >
                  {error}
                </p>
              ) : null}
            </div>

            <footer className="shrink-0 border-t border-border/70 bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
              <Button
                type="submit"
                disabled={loading}
                className="brand-gradient h-11 w-full rounded-full border-0 text-[15px] font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                {loading ? "জমা হচ্ছে…" : "যাচাইয়ের জন্য জমা দিন"}
              </Button>
              <p className="mt-2.5 text-center text-[11px] leading-snug text-muted-foreground">
                পরিচয় গোপন ·{" "}
                <Link
                  href="/verification"
                  className="text-foreground/80 underline-offset-2 hover:underline"
                  onClick={() => handleOpenChange(false)}
                >
                  যাচাই
                </Link>
                {" · "}
                <Link
                  href="/corrections"
                  className="text-foreground/80 underline-offset-2 hover:underline"
                  onClick={() => handleOpenChange(false)}
                >
                  নীতি
                </Link>
              </p>
            </footer>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReviewRow({
  k,
  v,
  muted,
}: {
  k: string;
  v: string;
  muted?: boolean;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/70 px-3.5 py-2.5">
      <span className="w-16 shrink-0 text-[12px] font-medium text-muted-foreground">
        {k}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 break-words text-[13px] leading-relaxed",
          muted && "text-muted-foreground",
        )}
      >
        {v}
      </span>
    </div>
  );
}
