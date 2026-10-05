import { ArticleCard } from "@/components/article-card";
import { Container } from "@/components/container";
import { PageIntro } from "@/components/page-intro";
import { getArticles } from "@/lib/cms";
import { matchesKind, placementLabel } from "@/lib/placements";
import { listRubrics } from "@/lib/rubrics";
import type { ArticleKind } from "@/lib/types";

export async function ArticleIndex({
  kind,
  eyebrow,
  title,
  lede,
  subrubric,
}: {
  kind: ArticleKind;
  eyebrow: string;
  title: string;
  lede: string;
  subrubric?: string;
}) {
  const rubrics = listRubrics();
  const parent = rubrics.find((item) => item.kind === kind);
  const articles = (await getArticles()).filter((item) => matchesKind(item, kind, rubrics, subrubric));
  return (
    <Container className="py-16 sm:py-20">
      <PageIntro eyebrow={eyebrow} title={title} lede={lede} />
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} category={placementLabel(article, rubrics, parent?.slug)} />
        ))}
      </div>
    </Container>
  );
}
