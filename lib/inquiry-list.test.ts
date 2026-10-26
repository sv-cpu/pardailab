import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { filterInquiries, inquiryFolder, inquiryFolderCounts, inquiryInFolder, inquiryPreview, type InquiryListRow } from "./inquiry-list";

function row(patch: Partial<InquiryListRow> & Pick<InquiryListRow, "id" | "status">): InquiryListRow {
  return {
    kind: "letter",
    kindLabel: "Письмо",
    name: "Анна",
    email: "anna@example.com",
    preview: "Текст",
    pageTitle: "О проекте",
    pagePath: "/o-proekte",
    important: false,
    dateLabel: "6 октября 2026 г.",
    searchText: "Анна anna@example.com Текст О проекте",
    ...patch,
  };
}

const rows = [
  row({ id: 1, status: "new", important: true, kind: "letter", searchText: "анна письмо договор" }),
  row({ id: 2, status: "read", kind: "correction", searchText: "борис сноска" }),
  row({ id: 3, status: "archive", important: true, searchText: "архив старое" }),
];

describe("inquiry folders", () => {
  it("keeps archive out of the inbox and the important folder", () => {
    assert.deepEqual(
      rows.filter((item) => inquiryInFolder(item, "all")).map((item) => item.id),
      [1, 2],
    );
    assert.deepEqual(
      rows.filter((item) => inquiryInFolder(item, "important")).map((item) => item.id),
      [1],
    );
    assert.deepEqual(
      rows.filter((item) => inquiryInFolder(item, "archive")).map((item) => item.id),
      [3],
    );
    assert.equal(inquiryFolderCounts(rows).new, 1);
    assert.equal(inquiryFolder("spam"), "new");
  });

  it("searches the current folder by name, mail and text", () => {
    const found = filterInquiries(rows, "all", "ДОГОВОР", "");
    assert.deepEqual(found.map((item) => item.id), [1]);
    assert.deepEqual(filterInquiries(rows, "read", "", "correction").map((item) => item.id), [2]);
    assert.deepEqual(filterInquiries(rows, "archive", "договор", ""), []);
  });

  it("shortens a long message to one line", () => {
    const preview = inquiryPreview("  Первая   строка\nи продолжение, которое не помещается в узкую колонку таблицы целиком и должно оборваться");
    assert.equal(preview.endsWith("…"), true);
    assert.equal(preview.includes("\n"), false);
    assert.ok(preview.length <= 90);
  });
});
