import { articleHref } from "@/lib/paths";
import type { Article, RatedModel, Service } from "@/lib/types";

export interface SearchHit {
  href: string;
  kind: string;
  title: string;
  description: string;
  meta: string;
}

export interface SearchGroups {
  query: string;
  articles: SearchHit[];
  services: SearchHit[];
  models: SearchHit[];
}

function normalize(value: string) {
  return value.toLocaleLowerCase("ru-RU").replaceAll("ё", "е");
}

function tokensOf(query: string) {
  return normalize(query).split(/\s+/).filter((token) => token.length > 1).slice(0, 8);
}

function matches(haystack: string, tokens: string[]) {
  const text = normalize(haystack);
  return tokens.every((token) => text.includes(token));
}

export function searchCatalog(
  query: string,
  data: { articles: Article[]; services: Service[]; models: RatedModel[] },
): SearchGroups {
  const tokens = tokensOf(query.trim().slice(0, 200));
  if (!tokens.length) {
    return { query: query.trim(), articles: [], services: [], models: [] };
  }

  const articles = data.articles
    .filter((item) =>
      matches([item.title, item.description, item.category, item.tags.join(" "), item.kind].join(" "), tokens),
    )
    .map((item) => ({
      href: articleHref(item.kind, item.slug),
      kind: item.kind === "research" ? "Исследование" : "Материал",
      title: item.title,
      description: item.description,
      meta: item.category,
    }));

  const services = data.services
    .filter((item) =>
      matches(
        [item.name, item.description, item.domains.join(" "), item.categories.join(" "), item.tags.join(" ")].join(" "),
        tokens,
      ),
    )
    .map((item) => ({
      href: `/resheniya/${item.slug}`,
      kind: "Сервис",
      title: item.name,
      description: item.description,
      meta: item.domains.join(" · "),
    }));

  const models = data.models
    .filter((item) => matches([item.name, item.vendor, item.summary, item.tags.join(" ")].join(" "), tokens))
    .map((item) => ({
      href: `/modeli/${item.slug}`,
      kind: "Модель",
      title: item.name,
      description: item.summary,
      meta: item.vendor,
    }));

  return { query: query.trim(), articles, services, models };
}
