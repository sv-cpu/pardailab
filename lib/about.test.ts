import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { aboutParagraphs, defaultAboutLab, getAboutLab, normalizeAboutLab, saveAboutLab } from "./about";
import { openDatabase } from "./db";

describe("about lab", () => {
  it("keeps four directions and fills empty fields from defaults", () => {
    const next = normalizeAboutLab({
      title: "PardAiLab",
      directions: [{ slug: "media", title: "Медиа", teaser: "", lede: "", body: "Свой текст." }],
    });
    assert.equal(next.directions.length, 4);
    assert.equal(next.directions.find((item) => item.slug === "media")?.body, "Свой текст.");
    assert.ok(next.directions.find((item) => item.slug === "issledovaniya")?.title);
  });

  it("splits body text into paragraphs", () => {
    assert.deepEqual(aboutParagraphs("Первый.\n\nВторой."), ["Первый.", "Второй."]);
  });

  it("stores and reads the about page from meta", () => {
    const db = openDatabase(path.join(mkdtempSync(path.join(tmpdir(), "pardai-")), "lab.db"));
    const draft = defaultAboutLab();
    draft.title = "Лаборатория тест";
    draft.directions[0].body = "Новое исследование.";
    saveAboutLab(draft, db);
    const stored = getAboutLab(db);
    assert.equal(stored.title, "Лаборатория тест");
    assert.equal(stored.directions[0].body, "Новое исследование.");
  });
});
