import { randomBytes, randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

import { cleanStaffBio } from "@/lib/bio";
import { getDb } from "@/lib/db";
import { coerceResume, type Resume, type ResumeInput } from "@/lib/resumes.shared";
import type { StaffUser } from "@/lib/users";

export * from "@/lib/resumes.shared";

export function createResumeToken() {
  return randomBytes(24).toString("base64url");
}

function sanitizeHtmlFields(resume: Resume): Resume {
  return {
    ...resume,
    about: cleanStaffBio(resume.about),
    jobs: resume.jobs.map((job) => ({ ...job, summary: cleanStaffBio(job.summary) })),
  };
}

export function normalizeResume(input: unknown, fallback?: Partial<Resume>): Resume {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const id = (typeof raw.id === "string" && raw.id.trim()) || fallback?.id || randomUUID();
  const token = (typeof raw.token === "string" && raw.token.trim()) || fallback?.token || createResumeToken();
  const ownerSlug = (typeof raw.ownerSlug === "string" && raw.ownerSlug.trim()) || fallback?.ownerSlug || "";
  return sanitizeHtmlFields(coerceResume(input, { id, token, ownerSlug, updatedAt: fallback?.updatedAt }, fallback));
}

export function ensureResumes(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      payload TEXT NOT NULL
    );
  `);
}

function writeResume(resume: Resume, db: DatabaseSync) {
  ensureResumes(db);
  db.prepare(
    `INSERT INTO resumes (id, token, payload) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET token = excluded.token, payload = excluded.payload`,
  ).run(resume.id, resume.token, JSON.stringify(resume));
}

export function listResumes(db = getDb()): Resume[] {
  ensureResumes(db);
  const rows = db.prepare("SELECT payload FROM resumes").all() as { payload: string }[];
  return rows
    .map((row) => normalizeResume(JSON.parse(row.payload)))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.person.fullName.localeCompare(b.person.fullName, "ru"));
}

export function listResumesFor(actor: StaffUser, db = getDb()) {
  const all = listResumes(db);
  if (actor.role === "editor") return all;
  return all.filter((item) => item.ownerSlug === actor.slug);
}

export function findResumeById(id: string, db = getDb()) {
  return listResumes(db).find((item) => item.id === id) ?? null;
}

export function findResumeByToken(token: string, db = getDb()) {
  ensureResumes(db);
  const row = db.prepare("SELECT payload FROM resumes WHERE token = ?").get(token) as { payload: string } | undefined;
  if (!row) return null;
  return normalizeResume(JSON.parse(row.payload));
}

export function canManageResume(resume: Resume, actor: StaffUser) {
  return actor.role === "editor" || resume.ownerSlug === actor.slug;
}

function withPhoto(resume: Resume, photo?: string | null): Resume {
  if (photo === null) {
    const next = { ...resume };
    delete next.photo;
    return next;
  }
  if (photo) return { ...resume, photo };
  return resume;
}

export function createResume(
  input: ResumeInput,
  ownerSlug: string,
  db = getDb(),
  photo?: string,
) {
  const resume = withPhoto(
    normalizeResume(
      { ...input, id: randomUUID(), token: createResumeToken(), ownerSlug, updatedAt: new Date().toISOString() },
      { ownerSlug },
    ),
    photo,
  );
  writeResume(resume, db);
  return resume;
}

export function updateResume(
  id: string,
  input: ResumeInput & { ownerSlug?: string },
  db = getDb(),
  photo?: string | null,
) {
  const current = findResumeById(id, db);
  if (!current) throw new Error("Резюме не найдено.");
  const base = normalizeResume(
    {
      ...input,
      id: current.id,
      token: current.token,
      ownerSlug: input.ownerSlug || current.ownerSlug,
      updatedAt: new Date().toISOString(),
    },
    { ...current, photo: undefined },
  );
  const nextPhoto = photo === undefined ? current.photo : photo === null ? undefined : photo;
  const resume = nextPhoto ? { ...base, photo: nextPhoto } : (() => {
    const clean = { ...base };
    delete clean.photo;
    return clean;
  })();
  writeResume(resume, db);
  return resume;
}

export function rotateResumeToken(id: string, db = getDb()) {
  const current = findResumeById(id, db);
  if (!current) throw new Error("Резюме не найдено.");
  const next = { ...current, token: createResumeToken(), updatedAt: new Date().toISOString() };
  writeResume(next, db);
  return next;
}

export function deleteResume(id: string, db = getDb()) {
  ensureResumes(db);
  const current = findResumeById(id, db);
  db.prepare("DELETE FROM resumes WHERE id = ?").run(id);
  return current;
}

export function parseResumePayload(raw: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Не удалось прочитать данные формы.");
  }
  return normalizeResume(parsed, { ownerSlug: "pending" });
}
