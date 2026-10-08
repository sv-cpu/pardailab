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

  it("keeps an uploaded image inside an existing article", () => {
    const src = "/uploads/media/6f1b1c2a-3d4e-4f50-8a61-1234567890ab.jpg";
    const clean = sanitizeArticleHtml(`<p>Уже готово</p><figure contenteditable="false"><img src="${src}" alt="Схема"></figure>`);
    assert.match(clean, /Уже готово/);
    assert.match(clean, new RegExp(`src="${src}"`));
    assert.match(clean, /alt="Схема"/);
    assert.match(clean, /contenteditable="false"/);
  });

  it("keeps a small uploaded video and forces playback controls", () => {
    const src = "/uploads/media/6f1b1c2a-3d4e-4f50-8a61-1234567890ab.mp4";
    const clean = sanitizeArticleHtml(`<video src="${src}" autoplay></video>`);
    assert.match(clean, new RegExp(`src="${src}"`));
    assert.match(clean, /controls/);
    assert.match(clean, /preload="metadata"/);
    assert.equal(clean.includes("autoplay"), false);
  });

  it("drops a remote or scripted video and a scripted image", () => {
    const clean = sanitizeArticleHtml(
      '<p>Текст</p><video src="https://cdn.example/big.mp4"></video><img src="javascript:alert(1)" alt="x"><video src="javascript:alert(1)"></video>',
    );
    assert.match(clean, /<p>Текст<\/p>/);
    assert.equal(clean.includes("video"), false);
    assert.equal(clean.includes("javascript:"), false);
    assert.equal(clean.includes("<img"), false);
  });

  it("keeps an external illustration and a youtube embed", () => {
    const clean = sanitizeArticleHtml(
      '<img src="https://cdn.example/chart.png" alt="График"><iframe src="https://www.youtube.com/embed/abc"></iframe>',
    );
    assert.match(clean, /src="https:\/\/cdn\.example\/chart\.png"/);
    assert.match(clean, /youtube\.com\/embed\/abc/);
  });
});
