import type { Article } from "@/lib/types";

export function relatedArticles(all: Article[], current: Article, limit = 3) {
  return all
    .filter((item) => item.slug !== current.slug || item.kind !== current.kind)
    .map((item) => {
      const shared = item.tags.filter((tag) => current.tags.includes(tag)).length;
      const sameKind = item.kind === current.kind ? 2 : 0;
      return { item, score: shared + sameKind };
    })
    .sort((a, b) => b.score - a.score || b.item.date.localeCompare(a.item.date))
    .slice(0, limit)
    .map((entry) => entry.item);
}
