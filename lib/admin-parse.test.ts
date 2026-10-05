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

  it("builds the address from the title and allows an article without tags", () => {
    const form = new FormData();
    form.set("title", "Новое досье");
    form.set("description", "Коротко.");
    form.set("rubric", "novosti");
    form.set("date", "2026-10-01");
    form.set("bodyHtml", "<p>Текст без меток.</p>");
    const parsed = parseArticle(form);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.value.slug, "novoe-dose");
    assert.deepEqual(parsed.value.tags, []);
  });

  it("keeps the form data path and rejects html that cleaning would erase", () => {
    const form = new FormData();
    form.set("title", "Пустой код");
    form.set("slug", "pustoy-kod");
    form.set("description", "Коротко.");
    form.set("rubric", "novosti");
    form.set("date", "2026-10-01");
    form.set("bodyHtml", "<script>alert(1)</script>");
    const parsed = parseArticle(form);
    assert.equal(parsed.ok, false);
  });
});
