import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { blocksToText, parseArticle, textToBlocks } from "./admin-parse";
import type { Block } from "./types";

const blocks: Block[] = [
  { type: "p", text: "Первый абзац." },
  { type: "h2", text: "Что проверить" },
  { type: "ul", items: ["Сроки", "Штрафы"] },
  { type: "ol", items: ["Спросить", "Сверить"] },
  { type: "note", title: "Граница", text: "Подпись остаётся у человека." },
];

describe("article body", () => {
  it("round-trips the editorial blocks", () => {
    assert.deepEqual(textToBlocks(blocksToText(blocks)), blocks);
  });
});

describe("parseArticle", () => {
  it("requires a research topic for research pieces", () => {
    const form = new FormData();
    form.set("slug", "nomer-128");
    form.set("kind", "research");
    form.set("title", "Новое досье");
    form.set("description", "Коротко.");
    form.set("category", "Документы");
    form.set("date", "2026-10-01");
    form.set("author", "Лаборатория");
    form.set("readingMinutes", "8");
    form.set("cover", "1");
    form.set("tags", "досье");
    form.set("body", "Текст исследования.");
    form.set("researchNumber", "128");
    const parsed = parseArticle(form);
    assert.equal(parsed.ok, false);
  });
});
