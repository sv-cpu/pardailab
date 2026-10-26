import { ArticleTable, type ArticleRubricOption } from "@/components/admin/article-table";
import type { ArticleTableRow } from "@/lib/article-table";
import { listArticles } from "@/lib/db";
import { comparePublished, formatPublished } from "@/lib/format";
import { kindLabel } from "@/lib/paths";
import { articlePlacements, placementLabels } from "@/lib/placements";
import { listRubrics } from "@/lib/rubrics";
import { currentUser, ownsArticle } from "@/lib/users";

export default async function ArticlesPage() {
  const actor = await currentUser();
  const rubrics = listRubrics();
  const rows: ArticleTableRow[] = listArticles()
    .filter((article) => !actor || actor.role === "editor" || ownsArticle(article, actor))
    .sort((a, b) => comparePublished(a.date, b.date) || a.title.localeCompare(b.title, "ru"))
    .map((article) => {
      const rubricSlugs = [
        ...new Set(
          articlePlacements(article).flatMap((item) => [item.rubric, item.subrubric].filter((slug): slug is string => Boolean(slug))),
        ),
      ];
      return {
        slug: article.slug,
        title: article.title,
        kind: article.kind,
        section: kindLabel[article.kind],
        rubric: placementLabels(article, rubrics),
        rubricSlugs,
        author: article.author,
        dateLabel: formatPublished(article.date),
      };
    });
  const used = new Set(rows.flatMap((row) => row.rubricSlugs));
  for (const rubric of rubrics) {
    if (rubric.parent && used.has(rubric.slug)) used.add(rubric.parent);
  }
  const options: ArticleRubricOption[] = rubrics
    .filter((rubric) => used.has(rubric.slug))
    .map((rubric) => ({ slug: rubric.slug, name: rubric.name, parent: rubric.parent }));
  return <ArticleTable rows={rows} rubrics={options} />;
}
