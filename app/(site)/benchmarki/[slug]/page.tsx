import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BenchmarkIssue } from "@/components/benchmark-issue";
import { Container } from "@/components/container";
import { InquiryForm } from "@/components/inquiry-form";
import { findBenchmark, ratedRows } from "@/lib/benchmarks";
import { ratingPeriod } from "@/lib/rating-view";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const issue = findBenchmark(slug);
  if (!issue) return {};
  return pageMeta({
    title: `${issue.title}, ${ratingPeriod(issue.tested)}`,
    description: `Выпуск рейтинга AI-моделей PardAiLab за ${ratingPeriod(issue.tested)}.`,
    path: `/benchmarki/${slug}`,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const issue = findBenchmark(slug);
  if (!issue) notFound();
  return (
    <Container className="py-16 sm:py-20">
      <p className="text-sm">
        <Link href="/benchmarki" className="text-olive">
          Все бенчмарки
        </Link>
      </p>
      <div className="mt-6">
        <BenchmarkIssue tested={issue.tested} nextUpdate={issue.nextUpdate} models={ratedRows(issue)} />
      </div>
      <div className="mt-16 border-t border-border pt-8">
        <InquiryForm
          kind="correction"
          pageTitle={issue.title}
          pagePath={`/benchmarki/${issue.slug}`}
          title="Замечание к выпуску"
          lede="Если в этом выпуске шкалы что-то не сходится, напишите."
        />
      </div>
    </Container>
  );
}
