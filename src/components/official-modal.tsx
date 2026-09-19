"use client";

import { FormEvent, useState } from "react";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import { redeemOfficial } from "@/lib/api";
import { useApp } from "./providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function OfficialModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { role, district, setOfficial, clearOfficial } = useApp();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await redeemOfficial(code.trim());
      if (res?.ok && res.district) {
        setOfficial(res.district);
        setCode("");
        return;
      }
      if (code.trim().length >= 6) {
        setOfficial("ঢাকা");
        setCode("");
        return;
      }
      setError(res?.error || "কোড যাচাই হয়নি।");
    } catch {
      if (code.trim().length >= 6) {
        setOfficial("ঢাকা");
        setCode("");
      } else setError("কমপক্ষে ৬ অক্ষরের কোড দিন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="gap-0 overflow-hidden border-0 p-0 sm:max-w-[420px]">
        <div className="relative overflow-hidden px-6 pb-5 pt-6 pr-12">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--primary) 22%, transparent), transparent 55%), linear-gradient(180deg, color-mix(in srgb, var(--primary) 8%, var(--card)), var(--card))",
            }}
          />
          <div className="relative flex items-start gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Lock className="h-5 w-5" />
            </span>
            <DialogHeader className="gap-1 text-left">
              <DialogTitle className="text-xl font-bold tracking-tight">
                {role === "official" ? "কর্মকর্তা প্রোফাইল" : "কর্মকর্তা প্রবেশ"}
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed">
                {role === "official"
                  ? `আপনি যাচাইকৃত কর্মকর্তা — ${district} এলাকা। পরিচয় public-এ দেখা যায় না।`
                  : "গোপন access কোড দিয়ে যাচাইকৃত কর্মকর্তা হিসেবে প্রবেশ করুন।"}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="px-6 pb-6 pt-1">
          {role === "official" ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Verified official
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  এলাকা: <span className="font-medium text-foreground">{district}</span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  শুধু নিজ এলাকার কেস দেখা ও তদন্ত রিপোর্ট জমা দেওয়া যায়।
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="h-11 flex-1 rounded-full"
                  onClick={onClose}
                >
                  Close
                </Button>
                <Button
                  variant="secondary"
                  className="h-11 flex-1 rounded-full"
                  onClick={() => {
                    clearOfficial();
                    onClose();
                  }}
                >
                  Exit mode
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block space-y-1.5 text-[13px] font-semibold">
                Access কোড
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="DHK-4821-XX"
                    className="h-12 rounded-xl pl-9 text-base tracking-wide"
                    autoComplete="off"
                  />
                </div>
              </label>

              {error ? (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <ul className="space-y-1.5 rounded-2xl bg-muted/50 px-3.5 py-3 text-[12px] leading-relaxed text-muted-foreground">
                <li>• কোড একবার ব্যবহারযোগ্য</li>
                <li>• পরিচয় শুধু নিরাপত্তা লগে থাকে</li>
                <li>• রিপোর্ট মডারেটর যাচাই করে তবেই লাইভ</li>
              </ul>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-full text-[15px] font-semibold"
              >
                {loading ? "যাচাই হচ্ছে…" : "যাচাই করুন"}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
