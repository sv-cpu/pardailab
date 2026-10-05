import { notFound } from "next/navigation";

import { deleteBenchmarkAction } from "@/app/admin/actions";
import { BenchmarkEditor } from "@/components/admin/benchmark-editor";
import { Notice } from "@/components/admin/ui";
import { findBenchmark } from "@/lib/benchmarks";
import { listModels } from "@/lib/db";
import { requireEditor } from "@/lib/users";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireEditor();
  const { slug } = await params;
  const query = await searchParams;
  const issue = findBenchmark(slug);
  if (!issue) notFound();
  const rows = [...issue.rows];
  while (rows.length < 10) rows.push({ modelSlug: "", versionName: "", vendor: "", scores: { speed: 5, cost: 5, quality: 5, russian: 5, code: 5, agents: 5, documents: 5, context: 5 } });
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-heading text-4xl tracking-tight">Выпуск</h1>
        <a href={`/benchmarki/${issue.slug}`} className="text-sm text-olive">
          Открыть на сайте
        </a>
      </div>
      <Notice saved={query.saved} error={query.error} />
      <BenchmarkEditor issue={{ ...issue, rows: rows.slice(0, 10) }} catalog={listModels()} originalSlug={issue.slug} />
      <form action={deleteBenchmarkAction}>
        <input type="hidden" name="slug" value={issue.slug} />
        <button type="submit" className="text-sm text-muted-foreground">
          Удалить выпуск
        </button>
      </form>
    </div>
  );
}
