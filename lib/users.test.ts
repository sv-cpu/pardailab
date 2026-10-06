import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { openDatabase } from "./db";
import { createUser, updateUser } from "./users";

const photo = "/uploads/avatars/6f1b1c2a-3d4e-4f50-8a61-1234567890ab.jpg";

describe("profile fields", () => {
  it("keeps a photo until it is replaced or removed", () => {
    const file = path.join(mkdtempSync(path.join(tmpdir(), "pardai-")), "lab.db");
    const db = openDatabase(file);
    const user = createUser(
      { name: "Анна", login: "anna1", password: "password1", role: "journalist", bio: "Текст", photo },
      db,
    );
    const renamed = updateUser(user.slug, { name: "Анна Иванова", bio: "Новый текст" }, db);
    assert.equal(renamed.photo, photo);
    assert.equal(renamed.name, "Анна Иванова");
    const replaced = updateUser(user.slug, { name: "Анна Иванова", bio: "Новый текст", photo: photo.replace("ab", "ac") }, db);
    assert.equal(replaced.photo, photo.replace("ab", "ac"));
    const cleared = updateUser(user.slug, { name: "Анна Иванова", bio: "Новый текст", photo: null }, db);
    assert.equal(cleared.photo, undefined);
  });
});
