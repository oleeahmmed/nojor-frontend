import Link from "next/link";
import type { ReactNode } from "react";
import { YtShell } from "@/components/yt-shell";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/about", label: "আমাদের সম্পর্কে" },
  { href: "/verification", label: "কীভাবে যাচাই হয়" },
  { href: "/corrections", label: "সংশোধন নীতি" },
] as const;

export function InfoPage({
  title,
  eyebrow,
  lead,
  activeHref,
  children,
}: {
  title: string;
  eyebrow: string;
  lead: string;
  activeHref: (typeof NAV)[number]["href"];
  children: ReactNode;
}) {
  return (
    <YtShell>
      <article className="min-h-full pb-16">
        <header className="relative overflow-hidden border-b border-border/50">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,var(--brand-soft),transparent_55%)]"
          />
          <div className="relative mx-auto max-w-3xl px-4 pb-8 pt-8 sm:px-6 sm:pt-10">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              {lead}
            </p>
            <nav className="mt-6 flex flex-wrap gap-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                    item.href === activeHref
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
          {children}
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
    <section>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-foreground/90">
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
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="flex gap-4 rounded-2xl border border-border/70 bg-card p-4"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-primary">
            {i + 1}
          </span>
          <div>
            <p className="font-semibold tracking-tight">{s.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
