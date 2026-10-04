import type { DatabaseSync } from "node:sqlite";

import { articles as localArticles } from "@/lib/content/articles";
import { getDb, listArticles, saveArticle } from "@/lib/db";
import { buildRubricSeed, sectionRubrics, transliterate, type RubricRecord } from "@/lib/rubric-seed";
import type { Article, ArticleKind } from "@/lib/types";

export type { RubricRecord };

export interface MenuRubric {
  slug: string;
  name: string;
  href: string;
  children: { slug: string; name: string; href: string }[];
}

const sectionHref: Record<string, string> = {
  novosti: "/novosti",
  praktika: "/praktika",
  razrabotka: "/razrabotka",
  issledovaniya: "/issledovaniya",
};

export function rubricHref(rubric: RubricRecord, all: RubricRecord[]): string {
  if (!rubric.parent) return sectionHref[rubric.slug] ?? `/rubrika/${rubric.slug}`;
  const parent = all.find((item) => item.slug === rubric.parent);
  const base: string = parent ? (sectionHref[parent.slug] ?? `/rubrika/${parent.slug}`) : "/rubrika";
  return `${base}?rubrika=${rubric.slug}`;
}

export function ensureRubrics(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rubrics (
      slug TEXT PRIMARY KEY,
      payload TEXT NOT NULL
    );
  `);
  const ready = db.prepare("SELECT value FROM meta WHERE key = 'rubrics'").get() as { value: string } | undefined;
  if (ready) return;
  const seeded = buildRubricSeed(localArticles.map(({ kind, category }) => ({ kind, category })));
  const insert = db.prepare("INSERT INTO rubrics (slug, payload) VALUES (?, ?)");
  db.exec("BEGIN");
  try {
    for (const rubric of seeded) insert.run(rubric.slug, JSON.stringify(rubric));
    const rows = db.prepare("SELECT slug, payload FROM articles").all() as { slug: string; payload: string }[];
    const update = db.prepare("UPDATE articles SET payload = ? WHERE slug = ?");
    for (const row of rows) {
      const article = JSON.parse(row.payload) as Article;
      const child = seeded.find(
        (item) => item.parent && item.name === article.category && item.parent === parentSlug(article.kind),
      );
      if (!child?.parent) continue;
      update.run(JSON.stringify({ ...article, rubric: child.parent, subrubric: child.slug }), row.slug);
    }
    db.prepare("INSERT INTO meta (key, value) VALUES ('rubrics', '1')").run();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function parentSlug(kind: ArticleKind) {
  return sectionRubrics.find((item) => item.kind === kind)?.slug ?? null;
}

export function listRubrics(db = getDb()) {
  ensureRubrics(db);
  const rows = db.prepare("SELECT payload FROM rubrics").all() as { payload: string }[];
  return rows
    .map((row) => JSON.parse(row.payload) as RubricRecord)
    .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name, "ru"));
}

export function menuRubrics(db = getDb()): MenuRubric[] {
  const all = listRubrics(db);
  return all
    .filter((item) => !item.parent)
    .map((item) => ({
      slug: item.slug,
      name: item.name,
      href: rubricHref(item, all),
      children: all
        .filter((child) => child.parent === item.slug)
        .map((child) => ({ slug: child.slug, name: child.name, href: rubricHref(child, all) })),
    }));
}

function writeRubric(rubric: RubricRecord, db: DatabaseSync) {
  db.prepare(
    `INSERT INTO rubrics (slug, payload) VALUES (?, ?)
     ON CONFLICT(slug) DO UPDATE SET payload = excluded.payload`,
  ).run(rubric.slug, JSON.stringify(rubric));
}

export function createRubric(name: string, parent: string | null, db = getDb()) {
  const all = listRubrics(db);
  if (parent && !all.some((item) => item.slug === parent && !item.parent)) throw new Error("Выберите рубрику.");
  const used = new Set(all.map((item) => item.slug));
  const slug = unique(transliterate(name), used);
  const position = all.reduce((max, item) => Math.max(max, item.position), 0) + 1;
  const rubric: RubricRecord = { slug, name: name.trim(), parent, position, kind: null };
  if (!rubric.name) throw new Error("Введите название.");
  writeRubric(rubric, db);
  return rubric;
}

export function renameRubric(slug: string, name: string, db = getDb()) {
  const all = listRubrics(db);
  const current = all.find((item) => item.slug === slug);
  if (!current) throw new Error("Рубрика не найдена.");
  const next = { ...current, name: name.trim() };
  if (!next.name) throw new Error("Введите название.");
  writeRubric(next, db);
  for (const article of listArticles(db)) {
    if (article.subrubric === slug) saveArticle({ ...article, category: next.name }, article.slug, db);
    else if (article.rubric === slug && !article.subrubric) saveArticle({ ...article, category: next.name }, article.slug, db);
  }
}

export function deleteRubric(slug: string, db = getDb()) {
  const all = listRubrics(db);
  const current = all.find((item) => item.slug === slug);
  if (!current) return;
  if (current.kind) throw new Error("Раздел сайта нельзя удалить, его можно только переименовать.");
  if (all.some((item) => item.parent === slug)) throw new Error("Сначала удалите подрубрики.");
  const articles = listArticles(db);
  if (articles.some((item) => item.rubric === slug || item.subrubric === slug)) {
    throw new Error("Рубрика стоит у статей. Сначала выберите у них другую.");
  }
  db.prepare("DELETE FROM rubrics WHERE slug = ?").run(slug);
}

function unique(base: string, used: Set<string>) {
  const root = base || "rubrika";
  let slug = root;
  let index = 2;
  while (used.has(slug)) {
    slug = `${root}-${index}`;
    index += 1;
  }
  return slug;
}
