import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { ensureBenchmarks } from "./benchmarks";
import { listModels, openDatabase, saveModel } from "./db";
import { modelRelease, modelTitle } from "./rating-view";

describe("model version", () => {
  it("keeps the family and shows the release", () => {
    const claude = { name: "Claude", versionName: "Claude Opus 5.5" };
    assert.equal(modelTitle(claude), "Claude Opus 5.5");
    assert.equal(modelRelease(claude), "Opus 5.5");
    const gpt = { name: "GPT", versionName: "GPT-6 Astra" };
    assert.equal(modelTitle(gpt), "GPT-6 Astra");
    assert.equal(modelRelease(gpt), "GPT-6 Astra");
    assert.equal(modelRelease({ name: "Qwen", versionName: "Qwen3.8-Max" }), "Qwen3.8-Max");
    assert.equal(modelRelease({ name: "DeepSeek", versionName: "DeepSeek V4 Pro" }), "V4 Pro");
  });

  it("fills a catalog card that was stored without a version", () => {
    const db = openDatabase(path.join(mkdtempSync(path.join(tmpdir(), "pardai-")), "lab.db"));
    const claude = listModels(db).find((item) => item.slug === "claude");
    assert.ok(claude);
    saveModel({ ...claude, versionName: "" }, claude.slug, db);
    const stored = db.prepare("SELECT payload FROM benchmarks WHERE slug = ?").get("2026-10") as { payload: string };
    const issue = JSON.parse(stored.payload) as { rows: { modelSlug: string; versionName: string }[] };
    issue.rows = issue.rows.map((row) => (row.modelSlug === "claude" ? { ...row, versionName: "Claude" } : row));
    db.prepare("UPDATE benchmarks SET payload = ? WHERE slug = ?").run(JSON.stringify(issue), "2026-10");
    ensureBenchmarks(db);
    assert.equal(listModels(db).find((item) => item.slug === "claude")?.versionName, "Claude Opus 5.5");
    const again = JSON.parse(
      (db.prepare("SELECT payload FROM benchmarks WHERE slug = ?").get("2026-10") as { payload: string }).payload,
    ) as { rows: { modelSlug: string; versionName: string }[] };
    assert.equal(again.rows.find((row) => row.modelSlug === "claude")?.versionName, "Claude Opus 5.5");
  });
});
