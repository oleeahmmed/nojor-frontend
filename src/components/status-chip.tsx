import { STATUS_META, normalizeStatus } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusChip({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const meta = STATUS_META[normalizeStatus(status)];
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-md border-0 px-1.5 py-0.5 text-[11px] font-semibold shadow-sm",
        "dark:ring-1 dark:ring-white/10 dark:brightness-90",
        className,
      )}
      style={{ background: meta.soft, color: meta.tone }}
    >
      {meta.label}
    </Badge>
  );
}
