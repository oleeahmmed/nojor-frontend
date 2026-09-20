"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { COMMUNITY } from "@/lib/community";
import { YtShell } from "@/components/yt-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Public submit is email-only — no form hits the API (abuse / attack surface).
 */
function SubmitBody() {
  const mailto = `mailto:${COMMUNITY.tips.email}?subject=${encodeURIComponent(COMMUNITY.tips.subject)}&body=${encodeURIComponent(
    "ভিডিও লিংক:\n\nজেলা / এলাকা (ঐচ্ছিক):\n\nসংক্ষিপ্ত বিবরণ (ঐচ্ছিক):\n",
  )}`;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-14">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "mb-6 -ml-2 gap-1",
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        হোম
      </Link>

      <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Send className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          ভিডিও পাঠান — শুধু ইমেইল
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          সাইটে ফর্ম দিয়ে জমা বন্ধ আছে (স্প্যাম ও হামলা এড়াতে)। YouTube /
          Facebook লিংক ইমেইলে পাঠান — টিম যাচাই করে আর্কাইভে যোগ করবে।
        </p>

        <ul className="mt-4 space-y-2 text-sm text-foreground/90">
          <li>· একই লিংক বারবার পাঠানোর দরকার নেই</li>
          <li>· জেলা / এলাকা লিখলে দ্রুত মিলবে</li>
          <li>· প্রকাশের পর Case ID ইমেইলে জানানো হতে পারে</li>
        </ul>

        <a
          href={mailto}
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-6 inline-flex h-12 w-full gap-2 rounded-full text-[15px]",
          )}
        >
          <Mail className="h-5 w-5" />
          {COMMUNITY.tips.email}
        </a>
        <p className="mt-3 text-center text-[12px] text-muted-foreground">
          Subject: {COMMUNITY.tips.subject}
        </p>
      </div>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">…</div>}>
      <YtShell>
        <SubmitBody />
      </YtShell>
    </Suspense>
  );
}
