"use client";

import {
  BadgeCheck,
  HeartHandshake,
  LifeBuoy,
  Mail,
  Send,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BRAND_MARK_TODONTO } from "@/components/brand-logo";
import { COMMUNITY } from "@/lib/community";
import { cn } from "@/lib/utils";

/** FAB always emerald — independent of YouTube/other app themes. */
const FAB = {
  gradient: "linear-gradient(135deg, #059669 0%, #0d9488 55%, #14b8a6 100%)",
  soft: "rgba(5, 150, 105, 0.14)",
};

type FabTab = "tips" | "access" | "donation";

/**
 * Floating helper (bottom-right):
 * 1) কীভাবে ভিডিও পাঠাবেন
 * 2) পুলিশ/তদন্ত কর্মকর্তা অ্যাক্সেস
 * 3) ডোনেশন / নন-প্রফিট সহায়তা
 */
export function PrivacyFab() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<FabTab>("tips");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const contact =
    tab === "tips"
      ? COMMUNITY.tips
      : tab === "access"
        ? COMMUNITY.official
        : COMMUNITY.donation;

  const header =
    tab === "tips"
      ? {
          title: "কীভাবে ভিডিও পাঠাবেন",
          sub: "পাবলিক হলে শুধু লিংকই যথেষ্ট",
          Icon: Send,
        }
      : tab === "access"
        ? {
            title: "পুলিশ / তদন্ত (ইমেইল)",
            sub: "লগইন লাগে না — Case ID দিয়ে ইমেইল",
            Icon: BadgeCheck,
          }
        : {
            title: "ডোনেশন / সহায়তা",
            sub: "নন-প্রফিট — পরিচয় গোপন থাকবে",
            Icon: HeartHandshake,
          };

  const HeaderIcon = header.Icon;

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-3 z-30 flex flex-col items-end gap-2.5 sm:right-5 sm:gap-3",
        "bottom-[calc(3.25rem+max(0.35rem,env(safe-area-inset-bottom)))] md:bottom-[max(1rem,env(safe-area-inset-bottom))]",
      )}
    >
      {open ? (
        <div
          className="pointer-events-auto w-[min(340px,calc(100vw-1.5rem))] origin-bottom-right overflow-hidden rounded-2xl border border-emerald-900/10 bg-background text-foreground shadow-2xl animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-200 dark:border-emerald-400/15"
          role="dialog"
          aria-label="নজর সহায়তা"
        >
          <div
            className="flex items-center gap-3 px-3.5 py-3 text-white sm:px-4 sm:py-3.5"
            style={{ backgroundImage: FAB.gradient }}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/25">
              <HeaderIcon className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-tight sm:text-[13.5px]">
                {header.title}
              </p>
              <p className="text-[11px] text-white/80">{header.sub}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/85 transition hover:bg-white/15 hover:text-white"
              aria-label="বন্ধ"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 border-b border-border/60 bg-muted/30 p-1.5">
            <TabBtn
              active={tab === "tips"}
              onClick={() => setTab("tips")}
              icon={<Send className="h-3.5 w-3.5" />}
              label="ভিডিও"
            />
            <TabBtn
              active={tab === "access"}
              onClick={() => setTab("access")}
              icon={<BadgeCheck className="h-3.5 w-3.5" />}
              label="পুলিশ"
            />
            <TabBtn
              active={tab === "donation"}
              onClick={() => setTab("donation")}
              icon={<HeartHandshake className="h-3.5 w-3.5" />}
              label="ডোনেশন"
            />
          </div>

          <div className="max-h-[min(42vh,300px)] space-y-2 overflow-y-auto px-3 py-3.5 sm:max-h-[min(50vh,360px)] sm:space-y-2.5 sm:px-3.5 sm:py-4">
            {tab === "tips" ? (
              <>
                <ChatBubble tone="tips">
                  পাবলিক ভিডিও: YouTube/Facebook লিংক ইমেইলে পাঠান। সাবজেক্টে{" "}
                  <strong>Case ID</strong> থাকলে আরও দ্রুত মিলবে।
                </ChatBubble>
                <ChatBubble tone="tips">
                  নতুন ঘটনা হলে আগে ইমেইল করুন — আমরা Case ID দেব। পরে সেই ID
                  দিয়ে লিংক/ভিডিও পাঠালেই যথেষ্ট; আলাদা ফর্ম লাগে না।
                </ChatBubble>
                <ChatBubble tone="tips">
                  প্রাইভেট ভিডিও: Google Drive লিংক বা ইমেইল অ্যাটাচমেন্ট। চাইলে
                  আপনার ইমেইল দিন — প্রকাশ হলে সেই ঠিকানায় কেসের লিংক যাবে।
                </ChatBubble>
              </>
            ) : null}

            {tab === "access" ? (
              <>
                <ChatBubble tone="access">
                  পুলিশ/তদন্ত কর্মকর্তা সাইটে লগইন করবেন না।{" "}
                  <strong>Case ID</strong> সহ ইমেইলে স্ট্যাটাস, মামলা নং, নোট
                  পাঠান।
                </ChatBubble>
                <ChatBubble tone="access">
                  উদাহরণ সাবজেক্ট:{" "}
                  <strong>Case ID NJ-260920-XXXX — স্ট্যাটাস আপডেট</strong>। বডিতে
                  আইনি অবস্থা, তারিখ, সূত্র লিখুন।
                </ChatBubble>
                <ChatBubble tone="access">
                  নজর টিম যাচাই করে সাইটে আপডেট করবে। সাধারণ নাগরিক এই ট্যাবের
                  ফ্লোতে ভিডিও পাঠাবেন না — “ভিডিও” ট্যাব ব্যবহার করুন।
                </ChatBubble>
              </>
            ) : null}

            {tab === "donation" ? (
              <>
                <ChatBubble tone="donation">
                  নজর একটি নন-প্রফিট প্রকল্প। চাইলে ডোনেশন দিয়ে আমাদের সাহায্য
                  করতে পারেন — সবাই সাহায্য করলে এটা আরও এগিয়ে যেতে পারবে।
                </ChatBubble>
                <ChatBubble tone="donation">
                  ইমেইলে কথা বলে সাহায্য করতে পারেন:{" "}
                  <strong className="font-semibold">{COMMUNITY.donation.email}</strong>
                </ChatBubble>
                <ChatBubble tone="donation">
                  সম্পূর্ণ তথ্য গোপন রাখা হবে। আমরা চাই না কারো পরিচয় প্রকাশ
                  পাক — মূল লক্ষ্য সবাইকে নিরাপদ রেখে এই যুদ্ধে শামিল রাখা।
                </ChatBubble>
              </>
            ) : null}
          </div>

          <div className="border-t border-border/60 px-3 py-2.5 sm:px-3.5 sm:py-3">
            <a
              href={`mailto:${contact.email}?subject=${encodeURIComponent(contact.subject)}`}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-full text-[12.5px] font-semibold text-white shadow-md transition hover:opacity-95 hover:shadow-lg sm:text-[13px]"
              style={{ backgroundImage: FAB.gradient }}
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{contact.email}</span>
            </a>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="নজর সহায়তা"
        aria-expanded={open}
        className={cn(
          "pointer-events-auto flex size-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 sm:size-12",
          open
            ? "bg-background text-foreground ring-1 ring-border"
            : "text-white shadow-[0_10px_28px_-8px_rgba(5,150,105,0.65)]",
        )}
        style={open ? undefined : { backgroundImage: FAB.gradient }}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <LifeBuoy className="h-6 w-6" strokeWidth={2.25} />
        )}
      </button>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-9 items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition sm:gap-1.5 sm:text-[12px]",
        active
          ? "bg-background text-emerald-700 shadow-sm ring-1 ring-emerald-900/10 dark:text-emerald-400 dark:ring-emerald-400/20"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ChatBubble({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: FabTab;
}) {
  return (
    <div className="flex items-end gap-2">
      {tone === "access" ? (
        <Image
          src={BRAND_MARK_TODONTO}
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0 rounded-full object-cover ring-1 ring-black/10"
        />
      ) : (
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundImage: FAB.gradient }}
        >
          {tone === "donation" ? (
            <HeartHandshake className="h-3.5 w-3.5" />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </span>
      )}
      <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted/60 px-3 py-2 text-[12px] leading-relaxed text-foreground sm:px-3.5 sm:py-2.5 sm:text-[12.5px]">
        {children}
      </p>
    </div>
  );
}
