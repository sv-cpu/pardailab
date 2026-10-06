import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { articles } from "./content/articles";
import { rateModels } from "./content/models";
import { services } from "./content/services";
import { searchCatalog, searchRecords, toSearchRecords, type SearchRecord } from "./search";
import type { Article } from "./types";

const catalog = { articles, services, models: rateModels() };

function record(href: string, title: string, parts: [number, string][]): SearchRecord {
  return { href, kind: "Новость", title, parts };
}

describe("search", () => {
  it("returns one list with an article, a service and a model", () => {
    const hits = searchCatalog("claude", catalog);
    assert.ok(hits.some((item) => item.href.includes("dlinnyy-kontekst")));
    assert.ok(hits.some((item) => item.href.endsWith("/claude") && item.kind === "Сервис"));
    assert.ok(hits.some((item) => item.href.endsWith("/claude") && item.kind === "Модель"));
    assert.equal(new Set(hits.map((item) => item.href)).size, hits.length);
  });

  it("finds a contract article by a remembered stem and by a body word", () => {
    for (const query of ["договор", "договора", "штрафы"]) {
      const hits = searchCatalog(query, catalog);
      assert.ok(
        hits.some((item) => item.href.includes("dlinnyy-kontekst")),
        query,
      );
    }
    const body = searchCatalog("автопродления", catalog);
    const hit = body.find((item) => item.href.includes("dlinnyy-kontekst"));
    assert.ok(hit);
    assert.match(hit.snippet, /автопродлен/i);
  });

  it("keeps a hit when one extra word is missing", () => {
    const hits = searchCatalog("договор отсутствующееслово", catalog);
    assert.ok(hits.some((item) => item.href.includes("dlinnyy-kontekst")));
  });

  it("ranks a title match above a body-only match", () => {
    const hits = searchRecords("договор", [
      record("/body", "Про другое", [[1, "рискованные пункты договора"]]),
      record("/title", "Разбор договора", [
        [8, "Разбор договора"],
        [1, "общий текст без нужного слова"],
      ]),
    ]);
    assert.equal(hits[0]?.href, "/title");
    assert.equal(hits[1]?.href, "/body");
  });

  it("matches a short stem inside an inflection and skips a tiny prefix", () => {
    const code = [record("/code", "Заметка", [[1, "кусок кода в примере"]])];
    assert.equal(searchRecords("код", code)[0]?.href, "/code");
    assert.equal(searchRecords("кода", code)[0]?.href, "/code");
    assert.equal(searchRecords("код", [record("/case", "Заметка", [[1, "пользователь пишет кодом"]])])[0]?.href, "/case");

    const program = [record("/program", "Заметка", [[8, "программа для редакции"]])];
    assert.equal(searchRecords("про", program).length, 0);
    assert.equal(searchRecords("прог", program)[0]?.href, "/program");
  });

  it("treats a two-letter token as a whole word and folds yo", () => {
    const words = [record("/or", "или нет", [[8, "или нет"]])];
    assert.equal(searchRecords("ии", words).length, 0);
    assert.equal(searchRecords("ии", [record("/ai", "Модель ИИ", [[8, "Модель ИИ"]])])[0]?.href, "/ai");
    assert.equal(searchRecords("елка", [record("/tree", "Ёлка", [[8, "Ёлка у входа"]])])[0]?.href, "/tree");
  });

  it("finds a word in html and ignores a script", () => {
    const article: Article = {
      slug: "html-note",
      kind: "news",
      title: "Заметка",
      description: "Короткая",
      category: "Редакция",
      date: "2026-01-01",
      author: "Редакция",
      readingMinutes: 1,
      cover: 1,
      tags: [],
      body: [{ type: "html", html: "<p>Редкий аккордеон</p><script>секретныйтокен</script>" }],
    };
    const data = { articles: [article], services: [], models: [] };
    assert.equal(searchCatalog("аккордеон", data)[0]?.href, "/novosti/html-note");
    assert.equal(searchCatalog("секретныйтокен", data).length, 0);
  });

  it("builds a catalog payload that stays small enough for the header", () => {
    const records = toSearchRecords(catalog);
    assert.ok(records.length > 10);
    assert.ok(JSON.stringify(records).length < 200_000);
  });
});
