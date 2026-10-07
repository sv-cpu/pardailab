import type { DatabaseSync } from "node:sqlite";

import { models as localModels } from "@/lib/content/models";
import { getDb, listModels, saveModel } from "@/lib/db";
import { overallScore } from "@/lib/scores";
import type { ModelProfile, ModelScores, RatedModel } from "@/lib/types";

export interface BenchmarkRow {
  modelSlug: string;
  versionName: string;
  vendor: string;
  scores: ModelScores;
}

export interface Benchmark {
  slug: string;
  title: string;
  tested: string;
  nextUpdate: string;
  rows: BenchmarkRow[];
}

const emptyScores = (): ModelScores => ({
  speed: 5,
  cost: 5,
  quality: 5,
  russian: 5,
  code: 5,
  agents: 5,
  documents: 5,
  context: 5,
});

export function blankRow(): BenchmarkRow {
  return { modelSlug: "", versionName: "", vendor: "", scores: emptyScores() };
}

export function ensureBenchmarks(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS benchmarks (
      slug TEXT PRIMARY KEY,
      payload TEXT NOT NULL
    );
  `);
  const count = (db.prepare("SELECT COUNT(*) AS total FROM benchmarks").get() as { total: number }).total;
  if (!count) seedBenchmark(db);
  syncCatalogVersions(db);
}

function seedBenchmark(db: DatabaseSync) {
  const models = (db.prepare("SELECT payload FROM models").all() as { payload: string }[])
    .map((row) => JSON.parse(row.payload) as ModelProfile)
    .sort((a, b) => overallScore(b.scores) - overallScore(a.scores));
  const rows = models.slice(0, 10).map((model) => ({
    modelSlug: model.slug,
    versionName: model.versionName?.trim() || model.name,
    vendor: model.vendor,
    scores: { ...model.scores },
  }));
  while (rows.length < 10) rows.push(blankRow());
  const issue: Benchmark = {
    slug: "2026-10",
    title: "Рейтинг AI-моделей",
    tested: "2026-10-01",
    nextUpdate: "2026-10-15",
    rows,
  };
  db.prepare("INSERT INTO benchmarks (slug, payload) VALUES (?, ?)").run(issue.slug, JSON.stringify(issue));
}

function syncCatalogVersions(db: DatabaseSync) {
  const stored = (db.prepare("SELECT payload FROM models").all() as { payload: string }[]).map(
    (row) => JSON.parse(row.payload) as ModelProfile,
  );
  for (const local of localModels) {
    const version = local.versionName?.trim();
    if (!version) continue;
    const current = stored.find((item) => item.slug === local.slug);
    if (!current || current.versionName?.trim()) continue;
    saveModel({ ...current, versionName: version }, current.slug, db);
    current.versionName = version;
  }
  const issues = (db.prepare("SELECT payload FROM benchmarks").all() as { payload: string }[]).map(
    (row) => JSON.parse(row.payload) as Benchmark,
  );
  for (const issue of issues) {
    let changed = false;
    const rows = issue.rows.map((row) => {
      const model = stored.find((item) => item.slug === row.modelSlug);
      const version = model?.versionName?.trim();
      if (!model || !version || row.versionName.trim() !== model.name.trim()) return row;
      changed = true;
      return { ...row, versionName: version };
    });
    if (changed) writeBenchmark({ ...issue, rows }, issue.slug, db);
  }
}

function writeBenchmark(issue: Benchmark, originalSlug: string, db: DatabaseSync) {
  if (originalSlug && originalSlug !== issue.slug) {
    const taken = db.prepare("SELECT slug FROM benchmarks WHERE slug = ?").get(issue.slug);
    if (taken) throw new Error("Такой адрес уже есть.");
    db.prepare("DELETE FROM benchmarks WHERE slug = ?").run(originalSlug);
  }
  db.prepare(
    `INSERT INTO benchmarks (slug, payload) VALUES (?, ?)
     ON CONFLICT(slug) DO UPDATE SET payload = excluded.payload`,
  ).run(issue.slug, JSON.stringify(issue));
}

export function listBenchmarks(db = getDb()) {
  ensureBenchmarks(db);
  const rows = db.prepare("SELECT payload FROM benchmarks").all() as { payload: string }[];
  return rows
    .map((row) => JSON.parse(row.payload) as Benchmark)
    .sort((a, b) => b.tested.localeCompare(a.tested) || b.slug.localeCompare(a.slug));
}

export function findBenchmark(slug: string, db = getDb()) {
  return listBenchmarks(db).find((item) => item.slug === slug) ?? null;
}

export function ratedRows(issue: Benchmark): RatedModel[] {
  return issue.rows
    .filter((row) => row.versionName.trim())
    .map((row) => ({
      slug: row.modelSlug || row.versionName,
      name: row.versionName,
      versionName: row.versionName,
      vendor: row.vendor,
      summary: "",
      bestFor: "",
      avoidWhen: "",
      tags: [],
      scores: { ...row.scores, overall: overallScore(row.scores) },
    }))
    .sort((a, b) => b.scores.overall - a.scores.overall || a.name.localeCompare(b.name, "ru"));
}

export function saveBenchmark(issue: Benchmark, originalSlug: string, db = getDb()) {
  const filled = issue.rows.filter((row) => row.versionName.trim());
  if (filled.length !== 10) throw new Error("В выпуске должно быть десять моделей с полным названием.");
  writeBenchmark({ ...issue, rows: filled }, originalSlug, db);
  const latest = listBenchmarks(db)[0];
  if (!latest || latest.slug !== issue.slug) return;
  const catalog = listModels(db);
  for (const row of filled) {
    if (!row.modelSlug) continue;
    const model = catalog.find((item) => item.slug === row.modelSlug);
    if (!model) continue;
    saveModel({ ...model, versionName: row.versionName, vendor: row.vendor || model.vendor, scores: row.scores, inRating: true }, model.slug, db);
  }
}

export function deleteBenchmark(slug: string, db = getDb()) {
  db.prepare("DELETE FROM benchmarks WHERE slug = ?").run(slug);
}

export function draftFromLatest(db = getDb()): Benchmark {
  const latest = listBenchmarks(db)[0];
  const rows = latest ? latest.rows.map((row) => ({ ...row, scores: { ...row.scores } })) : Array.from({ length: 10 }, blankRow);
  while (rows.length < 10) rows.push(blankRow());
  return {
    slug: "",
    title: "Рейтинг AI-моделей",
    tested: new Date().toISOString().slice(0, 10),
    nextUpdate: "",
    rows: rows.slice(0, 10),
  };
}
