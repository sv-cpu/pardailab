import "server-only";

import { cache } from "react";

import { articles as localArticles } from "@/lib/content/articles";
import { rateModels, models as localModels } from "@/lib/content/models";
import { services as localServices } from "@/lib/content/services";
import { listArticles, listModels, listServices } from "@/lib/db";
import { attachAuthors } from "@/lib/users";
import type { Article, ArticleIndex, Block, ModelProfile, Service } from "@/lib/types";

async function fromStore<T>(read: () => Promise<T[]>): Promise<T[] | null> {
  try {
    return await read();
  } catch {
    return null;
  }
}

const base = process.env.PARDAILABS_API_URL?.replace(/\/$/, "");

async function readCollection<T>(path: string, accept: (value: unknown) => value is T): Promise<T[] | null> {
  if (!base) return null;
  try {
    const response = await fetch(`${base}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) return null;
    const items = payload.filter(accept);
    return items.length ? items : null;
  } catch {
    return null;
  }
}

function isBlock(value: unknown): value is Block {
  if (!value || typeof value !== "object") return false;
  const block = value as Block;
  if (block.type === "p" || block.type === "h2") return typeof block.text === "string";
  if (block.type === "note") return typeof block.title === "string" && typeof block.text === "string";
  if (block.type === "ul" || block.type === "ol") {
    return Array.isArray(block.items) && block.items.every((item) => typeof item === "string");
  }
  if (block.type === "html") return typeof block.html === "string";
  return false;
}

function isArticle(value: unknown): value is Article {
  if (!value || typeof value !== "object") return false;
  const article = value as Article;
  return (
    typeof article.slug === "string" &&
    typeof article.title === "string" &&
    typeof article.kind === "string" &&
    Array.isArray(article.body) &&
    article.body.every(isBlock)
  );
}

function isService(value: unknown): value is Service {
  if (!value || typeof value !== "object") return false;
  const service = value as Service;
  return typeof service.slug === "string" && typeof service.name === "string" && typeof service.description === "string";
}

function isModel(value: unknown): value is ModelProfile {
  if (!value || typeof value !== "object") return false;
  const model = value as ModelProfile;
  return typeof model.slug === "string" && typeof model.name === "string" && typeof model.scores === "object";
}

function mergeBySlug<T extends { slug: string }>(local: T[], remote: T[] | null) {
  if (!remote) return local;
  const map = new Map(local.map((item) => [item.slug, item]));
  for (const item of remote) map.set(item.slug, item);
  return [...map.values()];
}

export const getArticles = cache(async () => {
  const remote = await readCollection("/articles", isArticle);
  const stored = await fromStore(async () => listArticles());
  return attachAuthors(mergeBySlug(stored ?? localArticles, remote)).sort((a, b) => b.date.localeCompare(a.date));
});

export const getServices = cache(async () => {
  const remote = await readCollection("/services", isService);
  const stored = await fromStore(async () => listServices());
  return mergeBySlug(stored ?? localServices, remote);
});

export const getModels = cache(async () => {
  const remote = await readCollection("/models", isModel);
  const stored = await fromStore(async () => listModels());
  return rateModels(mergeBySlug(stored ?? localModels, remote));
});

export function toIndex(items: Article[]): ArticleIndex[] {
  return items.map(({ slug, kind, title, description, category, tags, readingMinutes }) => ({
    slug,
    kind,
    title,
    description,
    category,
    tags,
    readingMinutes,
  }));
}
