import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { isStoredAvatar, removeAvatar, storeAvatar } from "./avatars";

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);

describe("stored avatars", () => {
  it("accepts only files saved for a profile", () => {
    assert.equal(isStoredAvatar("/uploads/avatars/6f1b1c2a-3d4e-4f50-8a61-1234567890ab.jpg"), true);
    assert.equal(isStoredAvatar("/uploads/avatars/../../etc/passwd"), false);
    assert.equal(isStoredAvatar("/uploads/covers/6f1b1c2a-3d4e-4f50-8a61-1234567890ab.jpg"), false);
  });

  it("stores a jpeg even when the browser omits the file type", async () => {
    const url = await storeAvatar(new File([jpeg], "face.jpg", { type: "" }));
    const stored = path.join(process.cwd(), "public", "uploads", "avatars", path.basename(url));
    try {
      assert.match(url, /^\/uploads\/avatars\/[0-9a-f-]{36}\.jpg$/);
      assert.equal(existsSync(stored), true);
    } finally {
      await removeAvatar(url);
    }
    assert.equal(existsSync(stored), false);
  });

  it("rejects a file that is not a real image", async () => {
    const file = new File(["not-a-picture"], "face.jpg", { type: "image/jpeg" });
    await assert.rejects(() => storeAvatar(file), /JPEG, PNG или WebP/);
  });

  it("does not follow a path outside the avatar folder", async () => {
    await removeAvatar("/uploads/avatars/../../package.json");
    assert.equal(existsSync(path.join(process.cwd(), "package.json")), true);
  });
});
