import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { openDatabase, saveArticle } from "./db";
import type { Article } from "./types";
import { articleCountLabel, createRubric, menuRubrics, moveRubric, rubricArticleCounts } from "./rubrics";

function article(slug: string, rubric: string, subrubric: string): Article {
  return {
    slug,
    kind: "news",
    title: "Проверка",
    description: "Проверка",
    category: "Проверка",
    rubric,
    subrubric,
    placements: [
      { rubric, subrubric },
      { rubric, subrubric },
    ],
    date: "2026-01-01",
    author: "Тест",
    readingMinutes: 1,
    cover: 0,
    tags: [],
    body: [{ type: "p", text: "Текст" }],
  };
}

describe("rubric list", () => {
  it("labels article counts in russian", () => {
    assert.equal(articleCountLabel(0), "Нет статей");
    assert.equal(articleCountLabel(1), "1 статья");
    assert.equal(articleCountLabel(2), "2 статьи");
    assert.equal(articleCountLabel(5), "5 статей");
    assert.equal(articleCountLabel(11), "11 статей");
    assert.equal(articleCountLabel(21), "21 статья");
    assert.equal(articleCountLabel(22), "22 статьи");
  });

  it("moves a section and a subrubric without mixing the other group", () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), "pardai-")), "lab.db");
    const db = openDatabase(file);
    const before = menuRubrics(db);
    const parent = before.find((item) => item.children.length > 1);
    assert.ok(parent);
    const other = before.find((item) => item.slug !== parent.slug && item.children.length > 0);
    assert.ok(other);

    moveRubric("praktika", "up", db);
    moveRubric("praktika", "up", db);
    moveRubric("issledovaniya", "down", db);
    const raised = menuRubrics(db);
    assert.deepEqual(
      raised.map((item) => item.slug),
      ["praktika", "novosti", "razrabotka", "issledovaniya"],
    );
    assert.deepEqual(
      raised.find((item) => item.slug === "praktika")?.children.map((item) => item.slug),
      before.find((item) => item.slug === "praktika")?.children.map((item) => item.slug),
    );

    const [first, second] = parent.children;
    assert.ok(first && second);
    moveRubric(second.slug, "up", db);
    moveRubric(second.slug, "up", db);
    const after = menuRubrics(db);
    assert.deepEqual(
      after.find((item) => item.slug === parent.slug)?.children.map((item) => item.slug).slice(0, 2),
      [second.slug, first.slug],
    );
    assert.deepEqual(
      after.find((item) => item.slug === other.slug)?.children.map((item) => item.slug),
      other.children.map((item) => item.slug),
    );
    assert.throws(() => moveRubric("net-takogo", "down", db), /Рубрика не найдена/);

    const added = createRubric("Лабораторные заметки", null, db);
    moveRubric(added.slug, "up", db);
    const slugs = menuRubrics(db).map((item) => item.slug);
    assert.equal(slugs.at(-2), added.slug);
    assert.equal(slugs.at(-1), "issledovaniya");
  });

  it("counts an article once for the section and the subrubric", () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), "pardai-")), "lab.db");
    const db = openDatabase(file);
    const child = menuRubrics(db).find((item) => item.slug === "novosti")?.children[0];
    assert.ok(child);
    const before = rubricArticleCounts(db);
    saveArticle(article("count-once", "novosti", child.slug), "", db);
    const after = rubricArticleCounts(db);
    assert.equal(after.get("novosti"), (before.get("novosti") ?? 0) + 1);
    assert.equal(after.get(child.slug), (before.get(child.slug) ?? 0) + 1);
  });
});
