import Link from "next/link";
import type { ReactNode } from "react";
import { YtShell } from "@/components/yt-shell";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/about", label: "আমাদের সম্পর্কে" },
  { href: "/verification", label: "কীভাবে যাচাই হয়" },
  { href: "/corrections", label: "সংশোধন নীতি" },
] as const;

/**
 * Compact info layout — fills main column, minimal chrome, readable body.
 * Avoids huge empty margins around a narrow centered column.
 */
export function InfoPage({
  title,
  lead,
  activeHref,
  children,
}: {
  title: string;
  lead: string;
  activeHref: (typeof NAV)[number]["href"];
  children: ReactNode;
  /** @deprecated unused — kept for call-site compat */
  eyebrow?: string;
}) {
  return (
    <YtShell>
      <article className="w-full min-w-0 pb-20 md:pb-10">
        <div className="w-full px-4 pt-5 sm:px-5 sm:pt-6 lg:px-8">
          <div className="w-full max-w-3xl">
            <nav
              aria-label="তথ্য পেজ"
              className="mb-4 flex flex-wrap gap-1.5 border-b border-border/60 pb-3"
            >
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition sm:text-[13px]",
                    item.href === activeHref
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <header className="mb-5 sm:mb-6">
              <h1 className="text-[1.65rem] font-bold leading-tight tracking-[-0.03em] sm:text-[1.85rem]">
                {title}
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
                {lead}
              </p>
            </header>

            <div className="divide-y divide-border/60">{children}</div>
          </div>
        </div>
      </article>
    </YtShell>
  );
}

export function InfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="py-4 first:pt-0 sm:py-5">
      <h2 className="text-[15px] font-semibold tracking-tight text-foreground sm:text-base">
        {title}
      </h2>
      <div className="mt-2 space-y-2.5 text-[14px] leading-relaxed text-foreground/90 sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

export function InfoSteps({
  steps,
}: {
  steps: { title: string; body: string }[];
}) {
  return (
    <section className="py-4 first:pt-0 sm:py-5">
      <h2 className="mb-3 text-[15px] font-semibold tracking-tight sm:text-base">
        ধাপসমূহ
      </h2>
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className={cn(
              "flex gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-3",
              i === steps.length - 1 && steps.length % 2 === 1 && "sm:col-span-2",
            )}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[12px] font-bold text-background">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold tracking-tight sm:text-[14px]">
                {s.title}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
