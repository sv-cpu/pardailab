import type { ArticleKind } from "@/lib/types";

export type ArticleTableRow = {
  slug: string;
  title: string;
  kind: ArticleKind;
  section: string;
  rubric: string;
  rubricSlugs: string[];
  author: string;
  dateLabel: string;
};

export type ArticleTableQuery = {
  text: string;
  kind: string;
  rubric: string;
  author: string;
};

export function filterArticleRows(rows: ArticleTableRow[], query: ArticleTableQuery) {
  const words = query.text.trim().toLocaleLowerCase("ru").split(/\s+/).filter(Boolean);
  return rows.filter((row) => {
    if (query.kind && row.kind !== query.kind) return false;
    if (query.author && row.author !== query.author) return false;
    if (query.rubric && !row.rubricSlugs.includes(query.rubric)) return false;
    if (!words.length) return true;
    const title = row.title.toLocaleLowerCase("ru");
    return words.every((word) => title.includes(word));
  });
}

export function articleListLabel(shown: number, total: number, narrowed: boolean) {
  if (!narrowed) return total === 0 ? "Статей пока нет" : countPhrase(total);
  if (shown === 0) return "Ничего не найдено";
  return `Показано ${shown} из ${total}`;
}

function countPhrase(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} статья`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} статьи`;
  return `${count} статей`;
}
