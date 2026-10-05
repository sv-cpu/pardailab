import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { PageIntro } from "@/components/page-intro";
import { formatDate, formatScore } from "@/lib/format";
import { listBenchmarks, ratedRows } from "@/lib/benchmarks";
import { ratingPeriod } from "@/lib/rating-view";
import { pageMeta } from "@/lib/seo";

const pageSize = 8;

export const metadata: Metadata = pageMeta({
  title: "Бенчмарки",
  description: "Выпуски рейтинга AI-моделей PardAiLab: от нового к старым.",
  path: "/benchmarki",
});

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const issues = listBenchmarks();
  const totalPages = Math.max(1, Math.ceil(issues.length / pageSize));
  const current = Math.min(totalPages, Math.max(1, Number(page) || 1));
  const slice = issues.slice((current - 1) * pageSize, current * pageSize);
  return (
    <Container className="py-16 sm:py-20">
      <PageIntro
        eyebrow="Бенчмарки"
        title="Рейтинги лаборатории"
        lede="Каждый выпуск — отдельная страница. Новый публикуется сверху и не переписывает предыдущие."
      />
      <ol className="mt-12 divide-y divide-border border-y border-border">
        {slice.map((issue) => {
          const leader = ratedRows(issue)[0];
          return (
            <li key={issue.slug} className="py-6">
              <p className="font-mono text-[11px] tracking-[0.14em] text-olive uppercase">{ratingPeriod(issue.tested)}</p>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                <Link href={`/benchmarki/${issue.slug}`} className="hover:text-olive">
                  {issue.title}
                </Link>
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Тестирование {formatDate(issue.tested)}
                {issue.nextUpdate ? ` · следующее ${formatDate(issue.nextUpdate)}` : ""}
                {leader ? ` · лидер ${leader.name}, ${formatScore(leader.scores.overall)}` : ""}
              </p>
            </li>
          );
        })}
      </ol>
      {totalPages > 1 ? (
        <nav className="mt-8 flex gap-4 text-sm" aria-label="Страницы бенчмарков">
          {current > 1 ? (
            <Link href={current === 2 ? "/benchmarki" : `/benchmarki?page=${current - 1}`} className="text-olive">
              Назад
            </Link>
          ) : null}
          <span className="text-muted-foreground">
            {current} из {totalPages}
          </span>
          {current < totalPages ? (
            <Link href={`/benchmarki?page=${current + 1}`} className="text-olive">
              Дальше
            </Link>
          ) : null}
        </nav>
      ) : null}
    </Container>
  );
}
