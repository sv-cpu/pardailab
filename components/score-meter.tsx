import { formatScore } from "@/lib/format";

export function ScoreMeter({ label, value, hint }: { label: string; value: number; hint?: string }) {
  const width = Math.max(0, Math.min(100, value * 10));
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4 text-sm">
        <span>
          {label}
          {hint ? <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span> : null}
        </span>
        <span className="font-mono text-olive">{formatScore(value)}</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-border"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={value}
        aria-valuetext={formatScore(value)}
      >
        <div className="h-full rounded-full bg-olive" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
