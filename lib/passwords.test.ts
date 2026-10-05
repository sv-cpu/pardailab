import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hashPassword, verifyPassword } from "./passwords";

describe("passwords", () => {
  it("accepts the original password and rejects another", () => {
    const stored = hashPassword("pardai-lab");
    assert.equal(verifyPassword("pardai-lab", stored), true);
    assert.equal(verifyPassword("other", stored), false);
  });
});
