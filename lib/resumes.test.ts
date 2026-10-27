import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { openDatabase } from "./db";
import {
  ageFromBirthDate,
  canManageResume,
  createResume,
  deleteResume,
  findResumeByToken,
  formatDurationMonths,
  formatJobPeriod,
  normalizeResume,
  rotateResumeToken,
  sampleResumeInput,
  updateResume,
} from "./resumes";

describe("resumes", () => {
  it("normalizes sample resume and computes age", () => {
    const sample = sampleResumeInput();
    const resume = normalizeResume({ ...sample, ownerSlug: "sergey" });
    assert.equal(resume.person.fullName, "Вихарев Сергей Владимирович");
    assert.equal(resume.jobs.length, 6);
    assert.equal(resume.target.specializations.length, 2);
    assert.equal(ageFromBirthDate("1975-02-06", new Date("2026-10-27T00:00:00Z")), 51);
    assert.equal(formatJobPeriod(resume.jobs[0]), "Июль 2026 — настоящее время");
    assert.equal(formatDurationMonths(19), "1 год 7 месяцев");
  });

  it("stores resume behind a rotatable private token", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "resumes-"));
    const db = openDatabase(path.join(dir, "test.db"));
    const created = createResume(sampleResumeInput(), "sergey", db);
    assert.ok(created.token.length >= 24);
    assert.equal(findResumeByToken(created.token, db)?.id, created.id);

    const rotated = rotateResumeToken(created.id, db);
    assert.notEqual(rotated.token, created.token);
    assert.equal(findResumeByToken(created.token, db), null);
    assert.equal(findResumeByToken(rotated.token, db)?.person.fullName, created.person.fullName);

    updateResume(created.id, { ...sampleResumeInput(), person: { ...sampleResumeInput().person, city: "Казань" } }, db);
    assert.equal(findResumeByToken(rotated.token, db)?.person.city, "Казань");

    const editor = { role: "editor" as const, slug: "other" };
    const owner = { role: "journalist" as const, slug: "sergey" };
    const stranger = { role: "journalist" as const, slug: "ivan" };
    assert.equal(canManageResume(created, editor as never), true);
    assert.equal(canManageResume(created, owner as never), true);
    assert.equal(canManageResume(created, stranger as never), false);

    deleteResume(created.id, db);
    assert.equal(findResumeByToken(rotated.token, db), null);
  });
});
