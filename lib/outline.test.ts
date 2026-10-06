import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { articleOutline, stampHeadingIds } from "./outline";
import type { Block } from "./types";

describe("article outline", () => {
  it("numbers headings in the order they appear", () => {
    const blocks: Block[] = [
      { type: "p", text: "Вступление" },
      { type: "h2", text: "Договор" },
      { type: "html", html: '<h2 id="old">Код</h2><p>x</p><h2><em>Голос</em></h2>' },
    ];
    assert.deepEqual(articleOutline(blocks), [
      { id: "razdel-1", text: "Договор" },
      { id: "razdel-2", text: "Код" },
      { id: "razdel-3", text: "Голос" },
    ]);
  });

  it("gives html headings the same ids as the outline", () => {
    const { html, count } = stampHeadingIds('<h2 id="old" class="x">Код</h2><h2>Голос</h2>', 1);
    assert.equal(count, 3);
    assert.match(html, /<h2 id="razdel-2" class="x">Код<\/h2>/);
    assert.match(html, /<h2 id="razdel-3">Голос<\/h2>/);
  });
});
