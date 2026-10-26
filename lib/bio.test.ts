import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { bioPlainText, cleanStaffBio } from "./bio";

describe("staff bio", () => {
  it("turns blank-line paragraphs into html", () => {
    const html = cleanStaffBio("Первый абзац\n\nВторой");
    assert.equal(html, "<p>Первый абзац</p>\n<p>Второй</p>");
  });

  it("drops scripts and javascript links", () => {
    const html = cleanStaffBio('<p>Текст</p><script>alert(1)</script><a href="javascript:alert(1)">ссылка</a>');
    assert.match(html, /<p>Текст<\/p>/);
    assert.equal(html.includes("script"), false);
    assert.equal(html.includes("javascript:"), false);
  });

  it("keeps markup that is already html", () => {
    const source = "<p>Уже <strong>готово</strong></p>";
    assert.equal(cleanStaffBio(source), source);
    assert.equal(cleanStaffBio(cleanStaffBio(source)), source);
  });

  it("stores nothing when the field is empty", () => {
    assert.equal(cleanStaffBio(""), "");
    assert.equal(cleanStaffBio("   "), "");
    assert.equal(cleanStaffBio("<p><br></p>"), "");
  });

  it("uses plain text for the page description", () => {
    assert.equal(bioPlainText("<p>Портал &amp; агенты</p>"), "Портал & агенты");
    assert.equal(bioPlainText("Коротко"), "Коротко");
    const long = "слово ".repeat(80).trim();
    const plain = bioPlainText(long, 40);
    assert.equal(plain.endsWith("…"), true);
    assert.equal(plain.includes("<"), false);
    assert.ok(plain.length <= 41);
  });
});
