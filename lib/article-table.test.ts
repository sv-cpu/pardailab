import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { articleListLabel, filterArticleRows, type ArticleTableRow } from "./article-table";

const rows: ArticleTableRow[] = [
  {
    slug: "dogovor",
    title: "Длинный контекст не отменяет чтение договора",
    kind: "news",
    section: "Новости",
    rubric: "Документы",
    rubricSlugs: ["novosti", "dokumenty"],
    author: "Анна",
    dateLabel: "30 сентября 2026 г.",
  },
  {
    slug: "ofis",
    title: "Письмо без лишней переписки",
    kind: "practice",
    section: "Практика",
    rubric: "Офис",
    rubricSlugs: ["praktika", "ofis"],
    author: "Борис",
    dateLabel: "1 сентября 2026 г.",
  },
];

describe("article table", () => {
  it("finds a title by words in any order and ignores case", () => {
    const found = filterArticleRows(rows, { text: "ДОГОВОР длинный", kind: "", rubric: "", author: "" });
    assert.deepEqual(found.map((row) => row.slug), ["dogovor"]);
  });

  it("narrows by section, rubric and author together", () => {
    const query = { text: "", kind: "news", rubric: "dokumenty", author: "Анна" };
    assert.deepEqual(filterArticleRows(rows, query).map((row) => row.slug), ["dogovor"]);
    assert.deepEqual(
      filterArticleRows(rows, { ...query, author: "Борис" }).map((row) => row.slug),
      [],
    );
    assert.deepEqual(
      filterArticleRows(rows, { text: "", kind: "", rubric: "novosti", author: "" }).map((row) => row.slug),
      ["dogovor"],
    );
  });

  it("labels the full list and an empty search", () => {
    assert.equal(articleListLabel(2, 2, false), "2 статьи");
    assert.equal(articleListLabel(1, 21, false), "21 статья");
    assert.equal(articleListLabel(0, 12, true), "Ничего не найдено");
    assert.equal(articleListLabel(3, 12, true), "Показано 3 из 12");
    assert.equal(articleListLabel(0, 0, false), "Статей пока нет");
  });
});
