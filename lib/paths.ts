import type { ArticleKind } from "@/lib/types";

const roots: Record<ArticleKind, string> = {
  news: "/novosti",
  practice: "/praktika",
  development: "/razrabotka",
  research: "/issledovaniya",
};

export const kindLabel: Record<ArticleKind, string> = {
  news: "Новости",
  practice: "Практика",
  development: "Разработка",
  research: "Исследования",
};

export function articleHref(kind: ArticleKind, slug: string) {
  return `${roots[kind]}/${slug}`;
}
