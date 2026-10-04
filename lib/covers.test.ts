import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isStoredCover, storeCover } from "./covers";

describe("stored cover paths", () => {
  it("accepts only files saved by the editor", () => {
    assert.equal(isStoredCover("/uploads/covers/6f1b1c2a-3d4e-4f50-8a61-1234567890ab.jpg"), true);
    assert.equal(isStoredCover("/uploads/covers/../../etc/passwd"), false);
    assert.equal(isStoredCover("/covers/cover-0.svg"), false);
  });

  it("rejects a file that is not a real image", async () => {
    const file = new File(["not-a-picture"], "cover.jpg", { type: "image/jpeg" });
    await assert.rejects(() => storeCover(file), /JPEG, PNG или WebP/);
  });
});
