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
    assert.deepEqual(stored.projects, []);
    assert.deepEqual(stored.developments, []);
  });

  it("keeps project cards with optional links and drops bad covers", () => {
    const next = normalizeAboutLab({
      projects: [
        {
          id: "alpha",
          title: "Альфа",
          description: "Описание.",
          cover: "/uploads/covers/00000000-0000-4000-8000-000000000001.jpg",
          url: "https://example.com",
        },
        {
          id: "beta",
          title: "Бета",
          description: "Без ссылки.",
          cover: "/uploads/covers/00000000-0000-4000-8000-000000000002.jpg",
        },
        { id: "bad", title: "Плохой", description: "Нет", cover: "https://evil.example/x.jpg" },
      ],
    });
    assert.equal(next.projects.length, 2);
    assert.equal(next.projects[0]?.url, "https://example.com");
    assert.equal(next.projects[1]?.url, undefined);
  });

  it("keeps development cards with HTML body and drops incomplete ones", () => {
    const next = normalizeAboutLab({
      developments: [
        {
          id: "agent",
          title: "Агент",
          summary: "Кратко.",
          body: "<p>Полный текст</p><script>x</script>",
          cover: "/uploads/covers/00000000-0000-4000-8000-000000000003.jpg",
        },
        {
          id: "empty",
          title: "Без текста",
          summary: "Кратко.",
          body: "",
          cover: "/uploads/covers/00000000-0000-4000-8000-000000000004.jpg",
        },
      ],
    });
    assert.equal(next.developments.length, 1);
    assert.equal(next.developments[0]?.title, "Агент");
    assert.match(next.developments[0]?.body ?? "", /<p>Полный текст<\/p>/);
    assert.doesNotMatch(next.developments[0]?.body ?? "", /script/i);
  });
});
