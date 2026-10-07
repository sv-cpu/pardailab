import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { openDatabase } from "./db";
import {
  createInquiry,
  deleteInquiry,
  getInquiry,
  listInquiries,
  openInquiry,
  readInquiry,
  recentInquiryCount,
  setInquiryStatus,
} from "./inquiries";

const letter = {
  kind: "letter",
  name: "Анна",
  email: "anna@example.com",
  message: "В абзаце про контекст перепутаны две модели.",
  pageTitle: "О проекте",
  pagePath: "/o-proekte",
  extra: "",
};

describe("inquiries", () => {
  it("rejects a short note, a bad address and an unknown kind", () => {
    assert.equal("error" in readInquiry({ ...letter, message: "коротко" }), true);
    assert.equal("error" in readInquiry({ ...letter, email: "не адрес" }), true);
    assert.equal("error" in readInquiry({ ...letter, kind: "spam" }), true);
    assert.equal("drop" in readInquiry({ ...letter, extra: "filled" }), true);
  });

  it("keeps a letter and a correction, newest first", () => {
    const db = openDatabase(path.join(mkdtempSync(path.join(tmpdir(), "pardai-")), "lab.db"));
    const accepted = readInquiry(letter);
    assert.ok("value" in accepted);
    const first = createInquiry(accepted.value, db, "2026-10-06T10:00:00.000Z");
    const correction = readInquiry({
      ...letter,
      kind: "correction",
      email: "Anna@Example.com",
      pageTitle: "Договор <script>",
      pagePath: "/issledovaniya/dlinnyy-kontekst-dogovory",
      message: "В цитате из договора съехала сноска.",
    });
    assert.ok("value" in correction);
    assert.equal(correction.value.email, "anna@example.com");
    assert.equal(correction.value.pageTitle, "Договор <script>");
    const second = createInquiry(correction.value, db, "2026-10-06T12:00:00.000Z");
    const rows = listInquiries(db);
    assert.deepEqual(
      rows.map((item) => item.id),
      [second, first],
    );
    assert.equal(recentInquiryCount("anna@example.com", "2026-10-06T11:00:00.000Z", db), 1);
    const opened = openInquiry(second, db);
    assert.equal(opened?.status, "read");
    setInquiryStatus(second, "done", db);
    assert.equal(getInquiry(second, db)?.status, "done");
    assert.equal(openInquiry(second, db)?.status, "done");
    deleteInquiry(first, db);
    assert.equal(getInquiry(first, db), null);
  });

  it("drops a page address that is not on this site", () => {
    const accepted = readInquiry({ ...letter, pagePath: "https://example.com" });
    assert.ok("value" in accepted);
    assert.equal(accepted.value.pagePath, "");
  });
});
