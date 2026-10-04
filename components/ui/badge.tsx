import { cn } from "@/lib/utils";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-2.5 py-1 text-xs font-medium text-olive",
        className,
      )}
    >
      {children}
    </span>
  );
}
