import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildRubricSeed, transliterate } from "./rubric-seed";

describe("rubric seed", () => {
  it("transliterates a russian name", () => {
    assert.equal(transliterate("Русский язык"), "russkiy-yazyk");
  });

  it("puts the same label under every section that uses it", () => {
    const rubrics = buildRubricSeed([
      { kind: "news", category: "Документы" },
      { kind: "research", category: "Документы" },
      { kind: "practice", category: "Офис" },
    ]);
    const documents = rubrics.filter((item) => item.name === "Документы");
    assert.deepEqual(
      documents.map((item) => item.parent).sort(),
      ["issledovaniya", "novosti"],
    );
    assert.equal(rubrics.find((item) => item.name === "Офис")?.parent, "praktika");
  });
});
