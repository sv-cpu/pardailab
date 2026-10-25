import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  aboutParagraphs,
  defaultAboutLab,
  ensureAboutHtml,
  getAboutLab,
  normalizeAboutLab,
  renderAboutHtml,
  saveAboutLab,
} from "./about";
import { openDatabase } from "./db";

describe("about lab", () => {
  it("keeps four directions and turns plain body into safe HTML", () => {
    const next = normalizeAboutLab({
      title: "PardAiLab",
      directions: [{ slug: "media", title: "Медиа", teaser: "", lede: "", body: "Свой текст." }],
    });
    assert.equal(next.directions.length, 4);
    assert.equal(next.directions.find((item) => item.slug === "media")?.body, "<p>Свой текст.</p>");
    assert.ok(next.directions.find((item) => item.slug === "issledovaniya")?.title);
  });

  it("keeps allowed HTML and drops scripts", () => {
    const next = normalizeAboutLab({
      body: '<p>Текст</p><script>alert(1)</script><h2>Заголовок</h2>',
    });
    assert.match(next.body, /<p>Текст<\/p>/);
    assert.match(next.body, /<h2>Заголовок<\/h2>/);
    assert.doesNotMatch(next.body, /script/i);
  });

  it("splits body text into paragraphs and builds HTML", () => {
    assert.deepEqual(aboutParagraphs("Первый.\n\nВторой."), ["Первый.", "Второй."]);
    assert.equal(ensureAboutHtml("Первый.\n\nВторой."), "<p>Первый.</p>\n<p>Второй.</p>");
    assert.equal(renderAboutHtml("<p>Ок</p><script>x</script>"), "<p>Ок</p>");
  });

  it("stores and reads the about page from meta", () => {
    const db = openDatabase(path.join(mkdtempSync(path.join(tmpdir(), "pardai-")), "lab.db"));
    const draft = defaultAboutLab();
    draft.title = "Лаборатория тест";
    draft.directions[0].body = "<p>Новое исследование.</p>";
    saveAboutLab(draft, db);
    const stored = getAboutLab(db);
    assert.equal(stored.title, "Лаборатория тест");
    assert.equal(stored.directions[0].body, "<p>Новое исследование.</p>");
  });
});
