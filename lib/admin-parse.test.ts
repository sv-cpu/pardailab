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
  it("counts reading time from the text and skips the removed fields", () => {
    const form = new FormData();
    form.set("slug", "nomer-128");
    form.set("title", "Новое досье");
    form.set("description", "Коротко.");
    form.set("rubric", "novosti");
    form.set("date", "2026-10-01");
    form.set("tags", "досье");
    form.set("body", "Текст исследования.");
    const parsed = parseArticle(form);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.value.readingMinutes, 1);
    assert.equal(parsed.value.research, undefined);
    assert.equal(parsed.value.whyItMatters, undefined);
    assert.equal(parsed.value.rubric, "novosti");
  });
});
