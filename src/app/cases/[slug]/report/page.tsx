"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fetchCase } from "@/lib/api";
import type { ArchiveCase } from "@/lib/types";
import { YtShell } from "@/components/yt-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function ReportForm() {
  const params = useParams<{ slug: string }>();
  const [c, setC] = useState<ArchiveCase | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    fetchCase(params.slug).then(setC).catch(() => setC(null));
  }, [params.slug]);

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Link
        href={`/cases/${params.slug}`}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "mb-4 gap-1 text-primary",
        )}
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Official report</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {c?.title ?? params.slug}
        </p>
        {ok ? (
          <p className="mt-5 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            রিপোর্ট জমা হয়েছে। যাচাইয়ের পর টাইমলাইনে যোগ হবে।
          </p>
        ) : (
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              setOk(true);
            }}
            className="mt-5 space-y-3"
          >
            <label className="block space-y-1.5 text-sm font-semibold">
              রিপোর্ট
              <Textarea
                required
                className="min-h-28"
                placeholder="তদন্ত আপডেট লিখুন…"
              />
            </label>
            <Button type="submit" className="w-full rounded-full">
              Submit report
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={null}>
      <YtShell>
        <ReportForm />
      </YtShell>
    </Suspense>
  );
}
