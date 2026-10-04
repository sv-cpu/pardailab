import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { articles } from "./content/articles";
import { models } from "./content/models";
import { services } from "./content/services";
import { deleteRecord, listArticles, openDatabase, saveArticle } from "./db";

describe("sqlite store", () => {
  it("seeds the archive and keeps an edit", () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), "pardai-")), "lab.db");
    const db = openDatabase(file);
    assert.equal(listArticles(db).length, articles.length);
    const serviceCount = (db.prepare("SELECT COUNT(*) AS total FROM services").get() as { total: number }).total;
    const modelCount = (db.prepare("SELECT COUNT(*) AS total FROM models").get() as { total: number }).total;
    assert.equal(serviceCount, services.length);
    assert.equal(modelCount, models.length);

    const article = listArticles(db).find((item) => item.slug === "kontekst-i-dokumenty");
    assert.ok(article);
    saveArticle({ ...article, title: "Проверка редакции" }, article.slug, db);
    const again = openDatabase(file);
    assert.equal(listArticles(again).find((item) => item.slug === "kontekst-i-dokumenty")?.title, "Проверка редакции");
    deleteRecord("articles", "kontekst-i-dokumenty", again);
    assert.equal(listArticles(again).some((item) => item.slug === "kontekst-i-dokumenty"), false);
  });
});
