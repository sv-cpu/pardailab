import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { matchesKind, matchesRubric } from "./placements";
import type { RubricRecord } from "./rubric-seed";
import type { Article } from "./types";

const rubrics: RubricRecord[] = [
  { slug: "novosti", name: "Новости", parent: null, position: 0, kind: "news" },
  { slug: "praktika", name: "Практика", parent: null, position: 1, kind: "practice" },
  { slug: "dokumenty", name: "Документы", parent: "novosti", position: 2, kind: null },
  { slug: "ofis", name: "Офис", parent: "praktika", position: 3, kind: null },
];

function article(extra: Partial<Article>): Article {
  return {
    slug: "material",
    kind: "news",
    title: "Материал",
    description: "Коротко.",
    category: "Документы",
    date: "2026-10-01",
    author: "Редакция",
    readingMinutes: 1,
    cover: 0,
    tags: [],
    body: [{ type: "p", text: "Текст." }],
    ...extra,
  };
}

describe("article placements", () => {
  it("lists a story in both sections and both subrubrics", () => {
    const item = article({
      rubric: "novosti",
      subrubric: "dokumenty",
      placements: [
        { rubric: "novosti", subrubric: "dokumenty" },
        { rubric: "praktika", subrubric: "ofis" },
      ],
    });
    assert.equal(matchesKind(item, "news", rubrics), true);
    assert.equal(matchesKind(item, "practice", rubrics), true);
    assert.equal(matchesKind(item, "news", rubrics, "dokumenty"), true);
    assert.equal(matchesKind(item, "practice", rubrics, "ofis"), true);
    assert.equal(matchesKind(item, "practice", rubrics, "dokumenty"), false);
    assert.equal(matchesRubric(item, "praktika", "ofis"), true);
  });

  it("keeps an old article that only has one rubric", () => {
    const item = article({ rubric: "novosti", subrubric: "dokumenty" });
    assert.equal(matchesKind(item, "news", rubrics, "dokumenty"), true);
    assert.equal(matchesKind(item, "practice", rubrics), false);
  });
});
