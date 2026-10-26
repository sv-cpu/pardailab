import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { openDatabase } from "./db";
import { createRubric, menuRubrics, moveRubric } from "./rubrics";

function sectionOrder(file: string) {
  return menuRubrics(openDatabase(file)).map((item) => ({
    slug: item.slug,
    children: item.children.map((child) => child.slug),
  }));
}

describe("main menu section order", () => {
  it("moves a section and keeps subrubrics with it", () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), "pardai-")), "lab.db");
    const db = openDatabase(file);
    const before = sectionOrder(file);
    assert.deepEqual(
      before.map((item) => item.slug),
      ["novosti", "praktika", "razrabotka", "issledovaniya"],
    );

    moveRubric("razrabotka", "up", db);
    const raised = sectionOrder(file);
    assert.deepEqual(
      raised.map((item) => item.slug),
      ["novosti", "razrabotka", "praktika", "issledovaniya"],
    );
    for (const section of before) {
      assert.deepEqual(raised.find((item) => item.slug === section.slug)?.children, section.children);
    }

    moveRubric("novosti", "up", db);
    moveRubric("issledovaniya", "down", db);
    assert.deepEqual(
      sectionOrder(file).map((item) => item.slug),
      ["novosti", "razrabotka", "praktika", "issledovaniya"],
    );

    const child = before.flatMap((item) => item.children)[0];
    assert.ok(child);
    assert.throws(() => moveRubric(child, "up", db), /Раздел не найден/);
    assert.throws(() => moveRubric("net-takogo", "down", db), /Раздел не найден/);

    const added = createRubric("Лабораторные заметки", null, db);
    moveRubric(added.slug, "up", db);
    const slugs = sectionOrder(file).map((item) => item.slug);
    assert.equal(slugs.at(-2), added.slug);
    assert.equal(slugs.at(-1), "issledovaniya");
  });
});
