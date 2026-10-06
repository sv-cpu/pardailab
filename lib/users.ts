import type { DatabaseSync } from "node:sqlite";
import { redirect } from "next/navigation";

import { adminCredentials, currentSession, secretsMatch } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import { transliterate } from "@/lib/rubric-seed";
import type { Article } from "@/lib/types";

export type StaffRole = "editor" | "journalist";

export interface StaffUser {
  slug: string;
  login: string;
  name: string;
  passwordHash: string;
  role: StaffRole;
  bio: string;
  photo?: string;
}

export const roleLabel: Record<StaffRole, string> = {
  editor: "Редактор",
  journalist: "Журналист",
};

export function ensureUsers(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      slug TEXT PRIMARY KEY,
      payload TEXT NOT NULL
    );
  `);
  const creds = adminCredentials();
  if (!creds) return;
  const rows = db.prepare("SELECT payload FROM users").all() as { payload: string }[];
  const users = rows.map((row) => JSON.parse(row.payload) as StaffUser);
  if (users.some((item) => item.login === creds.user)) return;
  const used = new Set(users.map((item) => item.slug));
  const slug = uniqueSlug(transliterate(creds.user) || "redaktor", used);
  const user: StaffUser = {
    slug,
    login: creds.user,
    name: creds.user,
    passwordHash: hashPassword(creds.password),
    role: "editor",
    bio: "",
  };
  db.prepare("INSERT INTO users (slug, payload) VALUES (?, ?)").run(slug, JSON.stringify(user));
}

function uniqueSlug(base: string, used: Set<string>) {
  let slug = base || "avtor";
  let index = 2;
  while (used.has(slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }
  return slug;
}

export function listUsers(db = getDb()) {
  ensureUsers(db);
  const rows = db.prepare("SELECT payload FROM users").all() as { payload: string }[];
  return rows
    .map((row) => JSON.parse(row.payload) as StaffUser)
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

export function findUserByLogin(login: string, db = getDb()) {
  return listUsers(db).find((item) => item.login === login) ?? null;
}

export async function requireEditor() {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "editor") redirect("/admin");
  return user;
}

export async function currentUser() {
  const session = await currentSession();
  if (!session) return null;
  return findUserByLogin(session.user);
}

export function findUserBySlug(slug: string, db = getDb()) {
  return listUsers(db).find((item) => item.slug === slug) ?? null;
}

export function authenticate(login: string, password: string, db = getDb()) {
  ensureUsers(db);
  const user = findUserByLogin(login, db);
  if (user && verifyPassword(password, user.passwordHash)) return user;
  const creds = adminCredentials();
  if (!creds || !secretsMatch(login, creds.user) || !secretsMatch(password, creds.password)) return null;
  const existing = findUserByLogin(creds.user, db);
  if (existing) {
    const next = { ...existing, passwordHash: hashPassword(creds.password), role: "editor" as const };
    writeUser(next, db);
    return next;
  }
  return null;
}

export function ownsArticle(article: Article, user: StaffUser) {
  return article.authorSlug === user.slug || article.author === user.name || article.author === user.login;
}

export function attachAuthors(articles: Article[], users = listUsers()) {
  return articles.map((article) => {
    const user = users.find(
      (item) => item.slug === article.authorSlug || item.login === article.author || item.name === article.author,
    );
    if (!user) return article;
    return { ...article, author: user.name, authorSlug: user.slug };
  });
}

function writeUser(user: StaffUser, db: DatabaseSync) {
  db.prepare(
    `INSERT INTO users (slug, payload) VALUES (?, ?)
     ON CONFLICT(slug) DO UPDATE SET payload = excluded.payload`,
  ).run(user.slug, JSON.stringify(user));
}

export function createUser(
  input: { name: string; login: string; password: string; role: StaffRole; bio: string; photo?: string },
  db = getDb(),
) {
  const name = input.name.trim();
  const login = input.login.trim();
  if (!name) throw new Error("Введите имя.");
  if (!/^[a-zA-Z0-9._-]{3,40}$/.test(login)) throw new Error("Логин — латиница, цифры, точка, _ или -, от 3 знаков.");
  if (input.password.length < 8) throw new Error("Пароль — не короче 8 знаков.");
  if (input.role !== "editor" && input.role !== "journalist") throw new Error("Выберите роль.");
  const users = listUsers(db);
  if (users.some((item) => item.login === login)) throw new Error("Такой логин уже есть.");
  const user: StaffUser = {
    slug: uniqueSlug(transliterate(name) || login, new Set(users.map((item) => item.slug))),
    login,
    name,
    passwordHash: hashPassword(input.password),
    role: input.role,
    bio: input.bio.trim(),
    ...(input.photo ? { photo: input.photo } : {}),
  };
  writeUser(user, db);
  return user;
}

export function updateUser(
  slug: string,
  input: { name: string; role?: StaffRole; bio: string; password?: string; photo?: string | null },
  db = getDb(),
) {
  const current = findUserBySlug(slug, db);
  if (!current) throw new Error("Пользователь не найден.");
  const name = input.name.trim();
  if (!name) throw new Error("Введите имя.");
  if (input.password && input.password.length < 8) throw new Error("Пароль — не короче 8 знаков.");
  const next: StaffUser = {
    ...current,
    name,
    bio: input.bio.trim(),
    role: input.role ?? current.role,
    passwordHash: input.password ? hashPassword(input.password) : current.passwordHash,
  };
  if (input.photo === null) delete next.photo;
  else if (input.photo) next.photo = input.photo;
  writeUser(next, db);
  return next;
}

export function deleteUser(slug: string, actor: StaffUser, db = getDb()) {
  if (slug === actor.slug) throw new Error("Нельзя удалить свою учётную запись.");
  const users = listUsers(db);
  const current = users.find((item) => item.slug === slug);
  if (!current) return;
  if (current.role === "editor" && users.filter((item) => item.role === "editor").length <= 1) {
    throw new Error("Должен остаться хотя бы один редактор.");
  }
  db.prepare("DELETE FROM users WHERE slug = ?").run(slug);
}
