import type { DatabaseSync } from "node:sqlite";

import { getDb } from "@/lib/db";
import type { ArticleKind } from "@/lib/types";

export interface ArticleViewHit {
  slug: string;
  title: string;
  kind: ArticleKind;
  views: number;
}

export function viewCountLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  const noun =
    mod10 === 1 && mod100 !== 11 ? "просмотр" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "просмотра" : "просмотров";
  return `${count.toLocaleString("ru-RU")} ${noun}`;
}

export function recordArticleView(slug: string, db: DatabaseSync = getDb()) {
  const found = db.prepare("SELECT slug FROM articles WHERE slug = ?").get(slug);
  if (!found) return false;
  db.prepare(
    `INSERT INTO article_views (slug, views) VALUES (?, 1)
     ON CONFLICT(slug) DO UPDATE SET views = views + 1`,
  ).run(slug);
  return true;
}

export function dropArticleViews(slug: string, db: DatabaseSync = getDb()) {
  db.prepare("DELETE FROM article_views WHERE slug = ?").run(slug);
}

export function moveArticleViews(from: string, to: string, db: DatabaseSync = getDb()) {
  if (!from || from === to) return;
  const source = db.prepare("SELECT views FROM article_views WHERE slug = ?").get(from) as { views: number } | undefined;
  if (!source) return;
  const dest = db.prepare("SELECT views FROM article_views WHERE slug = ?").get(to) as { views: number } | undefined;
  if (dest) {
    db.prepare("UPDATE article_views SET views = ? WHERE slug = ?").run(dest.views + source.views, to);
    db.prepare("DELETE FROM article_views WHERE slug = ?").run(from);
    return;
  }
  db.prepare("UPDATE article_views SET slug = ? WHERE slug = ?").run(to, from);
}

export function articleViewStats(
  articles: { slug: string; title: string; kind: ArticleKind }[],
  db: DatabaseSync = getDb(),
) {
  const rows = db.prepare("SELECT slug, views FROM article_views").all() as { slug: string; views: number }[];
  const bySlug = new Map(rows.map((row) => [row.slug, row.views]));
  const top = articles
    .map((article) => ({ ...article, views: bySlug.get(article.slug) ?? 0 }))
    .filter((article) => article.views > 0)
    .sort((a, b) => b.views - a.views || a.title.localeCompare(b.title, "ru"))
    .slice(0, 10);
  const total = articles.reduce((sum, article) => sum + (bySlug.get(article.slug) ?? 0), 0);
  return { total, top };
}
