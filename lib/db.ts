import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

import { articles as localArticles } from "@/lib/content/articles";
import { models as localModels } from "@/lib/content/models";
import { services as localServices } from "@/lib/content/services";
import { ensureRubrics } from "@/lib/rubrics";
import { ensureUsers } from "@/lib/users";
import type { Article, ModelProfile, Service } from "@/lib/types";

type Table = "articles" | "services" | "models";

let singleton: DatabaseSync | null = null;

export function databasePath() {
  return process.env.PARDAILABS_DB_PATH ?? path.join(process.cwd(), "data", "pardailabs.db");
}

function migrate(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      slug TEXT PRIMARY KEY,
      payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS services (
      slug TEXT PRIMARY KEY,
      payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS models (
      slug TEXT PRIMARY KEY,
      payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function seed(db: DatabaseSync) {
  const ready = db.prepare("SELECT value FROM meta WHERE key = 'seeded'").get() as { value: string } | undefined;
  if (ready) return;
  const insertArticle = db.prepare("INSERT INTO articles (slug, payload) VALUES (?, ?)");
  const insertService = db.prepare("INSERT INTO services (slug, payload) VALUES (?, ?)");
  const insertModel = db.prepare("INSERT INTO models (slug, payload) VALUES (?, ?)");
  db.exec("BEGIN");
  try {
    for (const article of localArticles) insertArticle.run(article.slug, JSON.stringify(article));
    for (const service of localServices) insertService.run(service.slug, JSON.stringify(service));
    for (const model of localModels) insertModel.run(model.slug, JSON.stringify(model));
    db.prepare("INSERT INTO meta (key, value) VALUES ('seeded', '1')").run();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function openDatabase(filename = databasePath()) {
  mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec("PRAGMA journal_mode = WAL");
  migrate(db);
  seed(db);
  ensureRubrics(db);
  ensureUsers(db);
  return db;
}

export function getDb() {
  if (!singleton) singleton = openDatabase();
  return singleton;
}

function readAll<T>(db: DatabaseSync, table: Table): T[] {
  const rows = db.prepare(`SELECT payload FROM ${table}`).all() as { payload: string }[];
  return rows.map((row) => JSON.parse(row.payload) as T);
}

export function listArticles(db = getDb()) {
  return readAll<Article>(db, "articles");
}

export function listServices(db = getDb()) {
  return readAll<Service>(db, "services");
}

export function listModels(db = getDb()) {
  return readAll<ModelProfile>(db, "models");
}

export function contentCounts(db = getDb()) {
  const count = (table: Table) => (db.prepare(`SELECT COUNT(*) AS total FROM ${table}`).get() as { total: number }).total;
  return { articles: count("articles"), services: count("services"), models: count("models") };
}

function save(db: DatabaseSync, table: Table, originalSlug: string, slug: string, payload: unknown) {
  const encoded = JSON.stringify(payload);
  db.exec("BEGIN");
  try {
    if (originalSlug && originalSlug !== slug) {
      const taken = db.prepare(`SELECT slug FROM ${table} WHERE slug = ?`).get(slug);
      if (taken) throw new Error("Такой адрес уже есть.");
      db.prepare(`DELETE FROM ${table} WHERE slug = ?`).run(originalSlug);
    }
    db.prepare(
      `INSERT INTO ${table} (slug, payload) VALUES (?, ?)
       ON CONFLICT(slug) DO UPDATE SET payload = excluded.payload`,
    ).run(slug, encoded);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function saveArticle(article: Article, originalSlug: string, db = getDb()) {
  save(db, "articles", originalSlug, article.slug, article);
}

export function saveService(service: Service, originalSlug: string, db = getDb()) {
  save(db, "services", originalSlug, service.slug, service);
}

export function saveModel(model: ModelProfile, originalSlug: string, db = getDb()) {
  save(db, "models", originalSlug, model.slug, model);
}

export function deleteRecord(table: Table, slug: string, db = getDb()) {
  db.prepare(`DELETE FROM ${table} WHERE slug = ?`).run(slug);
}
