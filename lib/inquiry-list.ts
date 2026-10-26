export type InquiryFolder = "new" | "read" | "archive" | "important" | "all";
export type InquiryListKind = "correction" | "letter";
export type InquiryListStatus = "new" | "read" | "archive";

export const inquiryFolderLabel: Record<InquiryFolder, string> = {
  new: "Новые",
  read: "Прочитанные",
  archive: "Архив",
  important: "Важное",
  all: "Все",
};

export const inquiryFolders: InquiryFolder[] = ["new", "read", "archive", "important", "all"];

export type InquiryListRow = {
  id: number;
  kind: InquiryListKind;
  kindLabel: string;
  name: string;
  email: string;
  preview: string;
  pageTitle: string;
  pagePath: string;
  status: InquiryListStatus;
  important: boolean;
  dateLabel: string;
  searchText: string;
};

export function inquiryFolder(value: string | undefined): InquiryFolder {
  return inquiryFolders.includes(value as InquiryFolder) ? (value as InquiryFolder) : "new";
}

export function inquiryInFolder(row: Pick<InquiryListRow, "status" | "important">, folder: InquiryFolder) {
  if (folder === "all") return row.status !== "archive";
  if (folder === "important") return row.important && row.status !== "archive";
  return row.status === folder;
}

export function inquiryPreview(message: string) {
  const line = message.replace(/\s+/g, " ").trim();
  if (line.length <= 90) return line;
  return `${line.slice(0, 89).trimEnd()}…`;
}

export function filterInquiries(rows: InquiryListRow[], folder: InquiryFolder, text: string, kind: string) {
  const words = text.trim().toLocaleLowerCase("ru").split(/\s+/).filter(Boolean);
  return rows.filter((row) => {
    if (!inquiryInFolder(row, folder)) return false;
    if (kind && row.kind !== kind) return false;
    if (!words.length) return true;
    const haystack = row.searchText.toLocaleLowerCase("ru");
    return words.every((word) => haystack.includes(word));
  });
}

export function inquiryFolderCounts(rows: InquiryListRow[]) {
  return Object.fromEntries(inquiryFolders.map((folder) => [folder, rows.filter((row) => inquiryInFolder(row, folder)).length])) as Record<
    InquiryFolder,
    number
  >;
}
