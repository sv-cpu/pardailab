import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { articleViewStats, dropArticleViews, moveArticleViews, recordArticleView, viewCountLabel } from "./article-views";
import { listArticles, openDatabase } from "./db";
import type { ArticleKind } from "./types";

describe("article views", () => {
  it("labels counts in russian", () => {
    assert.equal(viewCountLabel(0), "0 просмотров");
    assert.equal(viewCountLabel(1), "1 просмотр");
    assert.equal(viewCountLabel(2), "2 просмотра");
    assert.equal(viewCountLabel(5), "5 просмотров");
    assert.equal(viewCountLabel(11), "11 просмотров");
    assert.equal(viewCountLabel(21), "21 просмотр");
    assert.equal(viewCountLabel(22), "22 просмотра");
  });

  it("counts an existing article and ignores an unknown address", () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), "pardai-")), "lab.db");
    const db = openDatabase(file);
    const articles = listArticles(db);
    const first = articles[0];
    const second = articles[1];
    assert.ok(first && second);
    assert.equal(recordArticleView("net-takoy", db), false);
    assert.equal(recordArticleView(first.slug, db), true);
    recordArticleView(first.slug, db);
    recordArticleView(second.slug, db);
    const stats = articleViewStats(
      articles.map((item) => ({ slug: item.slug, title: item.title, kind: item.kind })),
      db,
    );
    assert.equal(stats.total, 3);
    assert.equal(stats.top[0]?.slug, first.slug);
    assert.equal(stats.top[0]?.views, 2);
    assert.equal(stats.top[1]?.slug, second.slug);
    assert.equal(stats.top.length <= 10, true);
  });

  it("keeps the ten most read and breaks a tie by title", () => {
    const articles = Array.from({ length: 12 }, (_, index) => ({
      slug: `a-${index}`,
      title: index === 3 ? "Альфа" : index === 4 ? "Бета" : `Текст ${index}`,
      kind: "news" as ArticleKind,
    }));
    const file = path.join(mkdtempSync(path.join(tmpdir(), "pardai-")), "lab.db");
    const db = openDatabase(file);
    const insert = db.prepare("INSERT INTO article_views (slug, views) VALUES (?, ?)");
    articles.forEach((article, index) => {
      const views = index === 3 || index === 4 ? 20 : index + 1;
      insert.run(article.slug, views);
    });
    insert.run("udalennaya", 100);
    const stats = articleViewStats(articles, db);
    assert.equal(stats.top.length, 10);
    assert.equal(stats.top.some((item) => item.slug === "udalennaya"), false);
    assert.equal(stats.top[0]?.slug, "a-3");
    assert.equal(stats.top[1]?.slug, "a-4");
    assert.equal(stats.total, articles.reduce((sum, article, index) => sum + (index === 3 || index === 4 ? 20 : index + 1), 0));
  });

  it("follows a renamed article and drops a deleted one", () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), "pardai-")), "lab.db");
    const db = openDatabase(file);
    const article = listArticles(db)[0];
    assert.ok(article);
    recordArticleView(article.slug, db);
    moveArticleViews(article.slug, "novyy-adres", db);
    const moved = db.prepare("SELECT views FROM article_views WHERE slug = ?").get("novyy-adres") as { views: number };
    assert.equal(moved.views, 1);
    assert.equal(db.prepare("SELECT slug FROM article_views WHERE slug = ?").get(article.slug), undefined);
    dropArticleViews("novyy-adres", db);
    assert.equal(db.prepare("SELECT slug FROM article_views WHERE slug = ?").get("novyy-adres"), undefined);
  });
});
