import Link from "next/link";

import { Notice } from "@/components/admin/ui";
import { listBenchmarks } from "@/lib/benchmarks";
import { formatDate } from "@/lib/format";
import { ratingPeriod } from "@/lib/rating-view";
import { requireEditor } from "@/lib/users";

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireEditor();
  const query = await searchParams;
  const issues = listBenchmarks();
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-heading text-4xl tracking-tight">Бенчмарки</h1>
        <Link href="/admin/benchmarks/new" className="rounded-full bg-olive px-4 py-2 text-sm text-accent-foreground">
          Новый выпуск
        </Link>
      </div>
      <Notice saved={query.saved} error={query.error} />
      <ul className="divide-y divide-border border-y border-border">
        {issues.map((issue) => (
          <li key={issue.slug}>
            <Link href={`/admin/benchmarks/${issue.slug}`} className="flex items-baseline justify-between gap-4 py-4 hover:text-olive">
              <span className="font-heading text-2xl">{ratingPeriod(issue.tested)}</span>
              <span className="font-mono text-xs text-muted-foreground">{formatDate(issue.tested)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
