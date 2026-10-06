import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { comparePublished, formatPublished, stampPublished } from "./format";

describe("publication time", () => {
  it("orders a later time on the same day first", () => {
    const stamps = ["2026-10-05", "2026-10-05T09:00:01", "2026-10-04T23:00:00", "2026-10-05T18:15:40"];
    assert.deepEqual([...stamps].sort(comparePublished), [
      "2026-10-05T18:15:40",
      "2026-10-05T09:00:01",
      "2026-10-05",
      "2026-10-04T23:00:00",
    ]);
  });

  it("keeps the seconds when the minute did not change", () => {
    const again = stampPublished("2026-10-05", "18:15", "2026-10-05T18:15:40", new Date("2026-10-05T18:15:59"));
    assert.equal(again, "2026-10-05T18:15:40");
    const moved = stampPublished("2026-10-05", "18:16", "2026-10-05T18:15:40", new Date("2026-10-05T15:16:07Z"));
    assert.match(moved, /^2026-10-05T18:16:\d{2}$/);
  });

  it("shows the clock only when a time was stored", () => {
    assert.match(formatPublished("2026-10-05T18:15:40"), /18:15/);
    assert.doesNotMatch(formatPublished("2026-10-05"), /\d{2}:\d{2}/);
  });
});