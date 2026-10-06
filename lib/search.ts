import { categoryBySlug } from "@/lib/categories";
import { articleHref } from "@/lib/paths";
import type { Article, ArticleKind, Block, RatedModel, Service } from "@/lib/types";

const WORD = /[0-9A-Za-zА-Яа-яЁё]+/g;
const BODY_CAP = 4000;
const PAYLOAD_CAP = 200_000;

const articleKind: Record<ArticleKind, string> = {
  news: "Новость",
  practice: "Практика",
  development: "Разработка",
  research: "Исследование",
};

export interface SearchRecord {
  href: string;
  kind: string;
  title: string;
  /** Вес поля и исходный текст. Заголовок 8, подзаголовки 5, описание 4, зачем это важно 3, метки 2, текст 1. */
  parts: [number, string][];
}

export interface SearchHit {
  href: string;
  kind: string;
  title: string;
  snippet: string;
}

export interface HighlightPart {
  text: string;
  match: boolean;
}

function normalize(value: string) {
  return value.toLocaleLowerCase("ru-RU").replaceAll("ё", "е");
}

export function tokensOf(query: string) {
  const found = normalize(query.trim().slice(0, 200)).match(WORD) ?? [];
  const tokens: string[] = [];
  for (const token of found) {
    if (token.length < 2 || tokens.includes(token)) continue;
    tokens.push(token);
    if (tokens.length === 8) break;
  }
  return tokens;
}

function sameWord(token: string, word: string) {
  if (token === word) return true;
  const shorter = token.length < word.length ? token : word;
  const longer = shorter === token ? word : token;
  if (shorter.length < 3) return false;
  if (!longer.startsWith(shorter)) return false;
  if (shorter.length >= 4) return true;
  return longer.length - shorter.length <= 3;
}

function plain(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function blockBody(block: Block) {
  if (block.type === "p") return block.text;
  if (block.type === "note") return `${block.title} ${block.text}`;
  if (block.type === "ul" || block.type === "ol") return block.items.join(" ");
  if (block.type === "html") return plain(block.html);
  return "";
}

function clean(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function push(parts: [number, string][], weight: number, text: string) {
  const value = clean(text);
  if (value) parts.push([weight, value]);
}

function articleRecord(item: Article): SearchRecord {
  const parts: [number, string][] = [];
  push(parts, 8, item.title);
  push(
    parts,
    5,
    [item.research?.topic ?? "", ...item.body.filter((block) => block.type === "h2").map((block) => block.text)].join(" "),
  );
  push(parts, 4, item.description);
  push(parts, 3, item.whyItMatters ?? "");
  push(parts, 2, [item.category, ...item.tags].join(" "));
  push(
    parts,
    1,
    item.body
      .filter((block) => block.type !== "h2")
      .map(blockBody)
      .join(" "),
  );
  return {
    href: articleHref(item.kind, item.slug),
    kind: articleKind[item.kind],
    title: item.title,
    parts,
  };
}

function serviceRecord(item: Service): SearchRecord {
  const parts: [number, string][] = [];
  push(parts, 8, item.name);
  push(parts, 4, item.description);
  push(
    parts,
    2,
    [...item.domains, ...item.categories.map((slug) => categoryBySlug(slug)?.label ?? slug), ...item.tags].join(" "),
  );
  return { href: `/resheniya/${item.slug}`, kind: "Сервис", title: item.name, parts };
}

function modelRecord(item: RatedModel): SearchRecord {
  const parts: [number, string][] = [];
  push(parts, 8, [item.name, item.versionName ?? ""].filter(Boolean).join(" "));
  push(parts, 4, item.summary);
  push(parts, 3, item.bestFor);
  push(parts, 2, [item.vendor, ...item.tags].join(" "));
  return { href: `/modeli/${item.slug}`, kind: "Модель", title: item.name, parts };
}

function capBodies(records: SearchRecord[]) {
  if (JSON.stringify(records).length <= PAYLOAD_CAP) return records;
  return records.map((record) => ({
    ...record,
    parts: record.parts.map(([weight, text]): [number, string] =>
      weight === 1 && text.length > BODY_CAP ? [weight, text.slice(0, BODY_CAP)] : [weight, text],
    ),
  }));
}

export function toSearchRecords(data: { articles: Article[]; services: Service[]; models: RatedModel[] }) {
  return capBodies([
    ...data.articles.map(articleRecord),
    ...data.services.map(serviceRecord),
    ...data.models.map(modelRecord),
  ]);
}

function wordsOf(text: string) {
  const words: { norm: string; index: number; length: number }[] = [];
  for (const match of text.matchAll(WORD)) {
    if (match.index === undefined) continue;
    words.push({ norm: normalize(match[0]), index: match.index, length: match[0].length });
  }
  return words;
}

function windowAround(text: string, index: number, length: number) {
  let start = Math.max(0, index - 48);
  let end = Math.min(text.length, index + length + 110);
  if (start > 0) {
    const gap = /\s+/.exec(text.slice(start, index));
    if (gap) start += gap.index + gap[0].length;
  }
  if (end < text.length) {
    const tail = text.slice(index + length, end);
    const last = tail.search(/\s+\S*$/);
    if (last > 0) end = index + length + last;
  }
  let slice = clean(text.slice(start, end));
  if (start > 0) slice = `…${slice}`;
  if (end < text.length) slice = `${slice}…`;
  return slice;
}

export function searchRecords(query: string, records: SearchRecord[], limit = 20): SearchHit[] {
  const tokens = tokensOf(query);
  if (!tokens.length) return [];

  const hits: (SearchHit & { score: number })[] = [];
  for (const record of records) {
    const best = new Array<number>(tokens.length).fill(0);
    let snippet = "";
    let snippetRank = -1;
    for (const [weight, text] of record.parts) {
      const seen = new Set<number>();
      let first: { index: number; length: number } | null = null;
      for (const word of wordsOf(text)) {
        for (let i = 0; i < tokens.length; i++) {
          if (seen.has(i) || !sameWord(tokens[i], word.norm)) continue;
          seen.add(i);
          if (weight > best[i]) best[i] = weight;
          if (!first) first = word;
        }
      }
      if (!seen.size || weight >= 8 || !first) continue;
      const rank = seen.size * 10 + weight;
      if (rank > snippetRank) {
        snippetRank = rank;
        snippet = windowAround(text, first.index, first.length);
      }
    }
    const weights = best.filter((weight) => weight > 0);
    if (!weights.length) continue;
    const matched = weights.length;
    const score = matched * 100 + weights.reduce((sum, weight) => sum + weight, 0) + (matched === tokens.length ? 40 : 0);
    hits.push({ href: record.href, kind: record.kind, title: record.title, snippet, score });
  }

  hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ru"));
  return hits.slice(0, limit).map(({ href, kind, title, snippet }) => ({ href, kind, title, snippet }));
}

export function searchCatalog(
  query: string,
  data: { articles: Article[]; services: Service[]; models: RatedModel[] },
  limit = 24,
) {
  return searchRecords(query, toSearchRecords(data), limit);
}

export function highlightParts(text: string, query: string): HighlightPart[] {
  const tokens = tokensOf(query);
  if (!tokens.length || !text) return [{ text, match: false }];
  const parts: HighlightPart[] = [];
  let last = 0;
  for (const match of text.matchAll(WORD)) {
    if (match.index === undefined) continue;
    if (match.index > last) parts.push({ text: text.slice(last, match.index), match: false });
    parts.push({ text: match[0], match: tokens.some((token) => sameWord(token, normalize(match[0]))) });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), match: false });
  return parts.length ? parts : [{ text, match: false }];
}
