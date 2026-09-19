"use client";

import { BadgeCheck, Mail, Send, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BRAND_MARK, BRAND_MARK_TODONTO } from "@/components/brand-logo";
import { COMMUNITY } from "@/lib/community";
import { cn } from "@/lib/utils";

/** FAB always emerald — independent of YouTube/other app themes. */
const FAB = {
  gradient: "linear-gradient(135deg, #059669 0%, #0d9488 55%, #14b8a6 100%)",
  soft: "rgba(5, 150, 105, 0.14)",
};

type FabTab = "tips" | "access";

/**
 * Floating helper (bottom-right):
 * 1) কীভাবে ভিডিও পাঠাবেন
 * 2) পুলিশ/তদন্ত কর্মকর্তা অ্যাক্সেস
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

  const isTips = tab === "tips";
  const contact = isTips ? COMMUNITY.tips : COMMUNITY.official;
  const mark = isTips ? BRAND_MARK : BRAND_MARK_TODONTO;

  return (
    <div className="pointer-events-none fixed right-3 bottom-[max(0.85rem,env(safe-area-inset-bottom))] z-30 flex flex-col items-end gap-2.5 sm:right-5 sm:bottom-[max(1rem,env(safe-area-inset-bottom))] sm:gap-3">
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
            <Image
              src={mark}
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-xl object-cover shadow-md ring-1 ring-white/25"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-tight sm:text-[13.5px]">
                {isTips ? "কীভাবে ভিডিও পাঠাবেন" : "পুলিশ / তদন্ত অ্যাক্সেস"}
              </p>
              <p className="text-[11px] text-white/80">
                {isTips
                  ? "পরিচয় গোপন রেখে জমা দিন"
                  : "কর্মকর্তাদের জন্য আলাদা চ্যানেল"}
              </p>
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

          <div className="grid grid-cols-2 gap-1 border-b border-border/60 bg-muted/30 p-1.5">
            <TabBtn
              active={isTips}
              onClick={() => setTab("tips")}
              icon={<Send className="h-3.5 w-3.5" />}
              label="ভিডিও পাঠান"
            />
            <TabBtn
              active={!isTips}
              onClick={() => setTab("access")}
              icon={<BadgeCheck className="h-3.5 w-3.5" />}
              label="অ্যাক্সেস নিন"
            />
          </div>

          <div className="max-h-[min(42vh,300px)] space-y-2 overflow-y-auto px-3 py-3.5 sm:max-h-[min(50vh,360px)] sm:space-y-2.5 sm:px-3.5 sm:py-4">
            {isTips ? (
              <>
                <ChatBubble mark={BRAND_MARK}>
                  ভিডিও ফাইল ইমেইলে অ্যাটাচ করুন — বড় হলে Google Drive লিংক
                  দিলেই চলবে।
                </ChatBubble>
                <ChatBubble mark={BRAND_MARK}>
                  ঘটনার তারিখ, জেলা ও সংক্ষিপ্ত বিবরণ লিখুন। নিজের নাম দেওয়ার
                  প্রয়োজন নেই।
                </ChatBubble>
                <ChatBubble mark={BRAND_MARK}>
                  নজর টিম যাচাই করে প্রকাশ করবে। আপনার ইমেইল-পরিচয় কখনো প্রকাশ
                  হবে না।
                </ChatBubble>
              </>
            ) : (
              <>
                <ChatBubble mark={BRAND_MARK_TODONTO}>
                  পুলিশ বা তদন্ত কর্মকর্তা হিসেবে নজরে অ্যাক্সেস চাইলে নিচের
                  ইমেইলে আবেদন করুন।
                </ChatBubble>
                <ChatBubble mark={BRAND_MARK_TODONTO}>
                  বিষয়ে লিখুন: নাম, পদবি, থানা/ইউনিট ও যোগাযোগ নম্বর। দাপ্তরিক
                  ইমেইল থেকে পাঠালে যাচাই দ্রুত হয়।
                </ChatBubble>
                <ChatBubble mark={BRAND_MARK_TODONTO}>
                  অনুমোদন হলে অ্যাক্সেস কোড ও নির্দেশনা পাঠানো হবে। সাধারণ
                  নাগরিক এই ঠিকানায় ভিডিও পাঠাবেন না।
                </ChatBubble>
              </>
            )}
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
          "pointer-events-auto flex size-12 items-center justify-center overflow-hidden rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 sm:size-11",
          open
            ? "bg-background text-foreground ring-1 ring-border"
            : "ring-1 ring-emerald-900/15",
        )}
        style={open ? undefined : { backgroundImage: FAB.gradient }}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <Image
            src={BRAND_MARK}
            alt=""
            width={44}
            height={44}
            className="size-full object-cover"
          />
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
        "flex h-9 items-center justify-center gap-1.5 rounded-xl text-[11.5px] font-semibold transition sm:text-[12px]",
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
  mark,
}: {
  children: React.ReactNode;
  mark: string;
}) {
  return (
    <div className="flex items-end gap-2">
      <Image
        src={mark}
        alt=""
        width={24}
        height={24}
        className="size-6 shrink-0 rounded-full object-cover ring-1 ring-black/10"
      />
      <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted/60 px-3 py-2 text-[12px] leading-relaxed text-foreground sm:px-3.5 sm:py-2.5 sm:text-[12.5px]">
        {children}
      </p>
    </div>
  );
}
