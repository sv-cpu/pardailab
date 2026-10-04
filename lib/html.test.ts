import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { blocksToHtml, sanitizeArticleHtml } from "./html";
import type { Block } from "./types";

describe("article html", () => {
  it("turns editorial blocks into html", () => {
    const blocks: Block[] = [
      { type: "h2", text: "Заголовок" },
      { type: "p", text: "Абзац" },
      { type: "ul", items: ["Один"] },
    ];
    const html = blocksToHtml(blocks);
    assert.match(html, /<h2>Заголовок<\/h2>/);
    assert.match(html, /<li>Один<\/li>/);
  });

  it("drops scripts and keeps a paragraph", () => {
    const clean = sanitizeArticleHtml("<p>Текст</p><script>alert(1)</script>");
    assert.match(clean, /<p>Текст<\/p>/);
    assert.equal(clean.includes("script"), false);
  });

  it("drops a javascript link", () => {
    const clean = sanitizeArticleHtml('<a href="javascript:alert(1)">ссылка</a>');
    assert.equal(clean.includes("javascript:"), false);
  });
});
