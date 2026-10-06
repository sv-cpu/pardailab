import type { RubricRecord } from "@/lib/rubric-seed";
import type { Article, ArticleKind } from "@/lib/types";

export interface Placement {
  rubric: string;
  subrubric?: string;
}

export function articlePlacements(article: Pick<Article, "rubric" | "subrubric" | "placements">): Placement[] {
  const stored = (article.placements ?? []).filter((item) => item.rubric).slice(0, 2);
  if (stored.length) {
    return stored.map((item) => (item.subrubric ? { rubric: item.rubric, subrubric: item.subrubric } : { rubric: item.rubric }));
  }
  if (!article.rubric) return [];
  return [article.subrubric ? { rubric: article.rubric, subrubric: article.subrubric } : { rubric: article.rubric }];
}

export function matchesRubric(article: Pick<Article, "rubric" | "subrubric" | "placements">, parent: string, child?: string) {
  return articlePlacements(article).some((item) => item.rubric === parent && (!child || item.subrubric === child));
}

export function matchesKind(
  article: Pick<Article, "kind" | "rubric" | "subrubric" | "placements">,
  kind: ArticleKind,
  rubrics: RubricRecord[],
  child?: string,
) {
  const placements = articlePlacements(article);
  if (!placements.length) return article.kind === kind && !child;
  return placements.some((item) => {
    const parent = rubrics.find((rubric) => rubric.slug === item.rubric && !rubric.parent);
    if (!parent?.kind || parent.kind !== kind) return false;
    return !child || item.subrubric === child;
  });
}

export function placementLabel(article: Article, rubrics: RubricRecord[], parentSlug?: string) {
  const placements = articlePlacements(article);
  const chosen = (parentSlug ? placements.find((item) => item.rubric === parentSlug) : undefined) ?? placements[0];
  if (!chosen) return article.category;
  const child = chosen.subrubric ? rubrics.find((item) => item.slug === chosen.subrubric) : undefined;
  const parent = rubrics.find((item) => item.slug === chosen.rubric);
  return child?.name ?? parent?.name ?? article.category;
}

export function placementLabels(article: Article, rubrics: RubricRecord[]) {
  const names = articlePlacements(article)
    .map((item) => {
      const child = item.subrubric ? rubrics.find((rubric) => rubric.slug === item.subrubric) : undefined;
      const parent = rubrics.find((rubric) => rubric.slug === item.rubric);
      return child?.name ?? parent?.name;
    })
    .filter((name): name is string => Boolean(name));
  return names.length ? names.join(" · ") : article.category;
}

export function usesRubric(article: Pick<Article, "rubric" | "subrubric" | "placements">, slug: string) {
  return articlePlacements(article).some((item) => item.rubric === slug || item.subrubric === slug);
}
