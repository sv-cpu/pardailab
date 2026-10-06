import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { Container } from "@/components/container";
import { PageIntro } from "@/components/page-intro";
import { getArticles } from "@/lib/cms";
import { matchesRubric, placementLabel } from "@/lib/placements";
import { listRubrics } from "@/lib/rubrics";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ rubrika?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const rubric = listRubrics().find((item) => item.slug === slug && !item.parent);
  if (!rubric) return {};
  return pageMeta({ title: rubric.name, description: rubric.name, path: `/rubrika/${slug}` });
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const { rubrika } = await searchParams;
  const rubrics = listRubrics();
  const parent = rubrics.find((item) => item.slug === slug && !item.parent);
  if (!parent || parent.kind) notFound();
  const child = rubrika ? rubrics.find((item) => item.slug === rubrika && item.parent === parent.slug) : undefined;
  const articles = (await getArticles()).filter((item) => matchesRubric(item, parent.slug, child?.slug));
  return (
    <Container className="py-16 sm:py-20">
      <PageIntro eyebrow={parent.name} title={child?.name ?? parent.name} lede={parent.name} />
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} category={placementLabel(article, rubrics, parent.slug)} />
        ))}
      </div>
    </Container>
  );
}
