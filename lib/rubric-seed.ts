import type { ArticleKind } from "@/lib/types";

export interface RubricRecord {
  slug: string;
  name: string;
  parent: string | null;
  position: number;
  kind: ArticleKind | null;
}

const kindOrder: ArticleKind[] = ["news", "practice", "development", "research"];

export const sectionRubrics: RubricRecord[] = [
  { slug: "novosti", name: "Новости", parent: null, position: 0, kind: "news" },
  { slug: "praktika", name: "Практика", parent: null, position: 1, kind: "practice" },
  { slug: "razrabotka", name: "Разработка", parent: null, position: 2, kind: "development" },
  { slug: "issledovaniya", name: "Исследования", parent: null, position: 3, kind: "research" },
];

const parentByKind: Record<ArticleKind, string> = {
  news: "novosti",
  practice: "praktika",
  development: "razrabotka",
  research: "issledovaniya",
};

const letters: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

export function transliterate(value: string) {
  const raw = value
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => letters[char] ?? char)
    .join("");
  return raw
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function uniqueSlug(base: string, used: Set<string>) {
  const root = base || "rubrika";
  let slug = root;
  let index = 2;
  while (used.has(slug)) {
    slug = `${root}-${index}`;
    index += 1;
  }
  used.add(slug);
  return slug;
}

export function buildRubricSeed(articles: { kind: ArticleKind; category: string }[]) {
  const counts = new Map<string, Map<ArticleKind, number>>();
  for (const article of articles) {
    const byKind = counts.get(article.category) ?? new Map<ArticleKind, number>();
    byKind.set(article.kind, (byKind.get(article.kind) ?? 0) + 1);
    counts.set(article.category, byKind);
  }
  const used = new Set(sectionRubrics.map((item) => item.slug));
  const children: RubricRecord[] = [];
  let position = 0;
  for (const name of [...counts.keys()].sort((a, b) => a.localeCompare(b, "ru"))) {
    const byKind = counts.get(name)!;
    for (const kind of kindOrder) {
      if (!byKind.get(kind)) continue;
      children.push({
        slug: uniqueSlug(transliterate(name), used),
        name,
        parent: parentByKind[kind],
        position,
        kind: null,
      });
      position += 1;
    }
  }
  return [...sectionRubrics, ...children];
}

export function parentForKind(kind: ArticleKind) {
  return parentByKind[kind];
}
