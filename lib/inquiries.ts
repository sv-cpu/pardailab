import { getDb } from "@/lib/db";

export type InquiryKind = "correction" | "letter";
export type InquiryStatus = "new" | "read" | "done";

export const inquiryKindLabel: Record<InquiryKind, string> = {
  correction: "Замечание",
  letter: "Письмо",
};

export const inquiryStatusLabel: Record<InquiryStatus, string> = {
  new: "Новое",
  read: "Прочитано",
  done: "Разобрано",
};

export interface Inquiry {
  id: number;
  createdAt: string;
  kind: InquiryKind;
  name: string;
  email: string;
  message: string;
  pageTitle: string;
  pagePath: string;
  status: InquiryStatus;
}

export interface InquiryDraft {
  kind: InquiryKind;
  name: string;
  email: string;
  message: string;
  pageTitle: string;
  pagePath: string;
}

type InquiryRow = {
  id: number;
  created_at: string;
  kind: string;
  name: string;
  email: string;
  message: string;
  page_title: string;
  page_path: string;
  status: string;
};

const kinds = new Set<InquiryKind>(["correction", "letter"]);
const statuses = new Set<InquiryStatus>(["new", "read", "done"]);

function clean(value: string) {
  return value.replace(/\0/g, "").trim();
}

function cleanPath(value: string) {
  const path = clean(value).slice(0, 200);
  return /^\/[a-z0-9/-]*$/.test(path) ? path : "";
}

export function readInquiry(input: {
  kind: string;
  name: string;
  email: string;
  message: string;
  pageTitle: string;
  pagePath: string;
  extra: string;
}): { drop: true } | { error: string } | { value: InquiryDraft } {
  if (clean(input.extra)) return { drop: true };
  const kind = input.kind.trim();
  if (!kinds.has(kind as InquiryKind)) return { error: "Не удалось отправить сообщение." };
  const name = clean(input.name).replace(/\s+/g, " ");
  if (name.length < 1 || name.length > 80) return { error: "Напишите, как к вам обращаться." };
  const email = clean(input.email).toLowerCase();
  if (email.length > 120 || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
    return { error: "Укажите адрес электронной почты, чтобы можно было ответить." };
  }
  const message = clean(input.message);
  if (message.length < 8) return { error: "Напишите, что именно не сходится." };
  if (message.length > 4000) return { error: "Сообщение слишком длинное. Сократите его." };
  return {
    value: {
      kind: kind as InquiryKind,
      name,
      email,
      message,
      pageTitle: clean(input.pageTitle).replace(/\s+/g, " ").slice(0, 180),
      pagePath: cleanPath(input.pagePath),
    },
  };
}

function rowToInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    createdAt: row.created_at,
    kind: kinds.has(row.kind as InquiryKind) ? (row.kind as InquiryKind) : "letter",
    name: row.name,
    email: row.email,
    message: row.message,
    pageTitle: row.page_title,
    pagePath: row.page_path,
    status: statuses.has(row.status as InquiryStatus) ? (row.status as InquiryStatus) : "new",
  };
}

export function createInquiry(draft: InquiryDraft, db = getDb(), now = new Date().toISOString()) {
  const result = db
    .prepare(
      `INSERT INTO inquiries (created_at, kind, name, email, message, page_title, page_path, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
    )
    .run(now, draft.kind, draft.name, draft.email, draft.message, draft.pageTitle, draft.pagePath);
  return Number(result.lastInsertRowid);
}

export function listInquiries(db = getDb()) {
  const rows = db.prepare("SELECT * FROM inquiries ORDER BY id DESC").all() as InquiryRow[];
  return rows.map(rowToInquiry);
}

export function inquiryCounts(db = getDb()) {
  const total = (db.prepare("SELECT COUNT(*) AS total FROM inquiries").get() as { total: number }).total;
  const fresh = (db.prepare("SELECT COUNT(*) AS total FROM inquiries WHERE status = 'new'").get() as { total: number }).total;
  return { total, fresh };
}

export function recentInquiryCount(email: string, since: string, db = getDb()) {
  const row = db
    .prepare("SELECT COUNT(*) AS total FROM inquiries WHERE email = ? AND created_at >= ?")
    .get(email, since) as { total: number };
  return row.total;
}

export function getInquiry(id: number, db = getDb()) {
  const row = db.prepare("SELECT * FROM inquiries WHERE id = ?").get(id) as InquiryRow | undefined;
  return row ? rowToInquiry(row) : null;
}

export function openInquiry(id: number, db = getDb()) {
  const item = getInquiry(id, db);
  if (!item) return null;
  if (item.status === "new") {
    db.prepare("UPDATE inquiries SET status = 'read' WHERE id = ? AND status = 'new'").run(id);
    return getInquiry(id, db);
  }
  return item;
}

export function setInquiryStatus(id: number, status: InquiryStatus, db = getDb()) {
  db.prepare("UPDATE inquiries SET status = ? WHERE id = ?").run(status, id);
}

export function deleteInquiry(id: number, db = getDb()) {
  db.prepare("DELETE FROM inquiries WHERE id = ?").run(id);
}
