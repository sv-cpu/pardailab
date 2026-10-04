"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { adminCredentials, clearSession, currentSession, secretsMatch, startSession } from "@/lib/auth";
import { parseArticle, parseModel, parseService } from "@/lib/admin-parse";
import { deleteRecord, saveArticle, saveModel, saveService } from "@/lib/db";

export type LoginState = { error?: string };

function publish() {
  updateTag("content");
  revalidatePath("/", "layout");
}

async function guard() {
  if (!(await currentSession())) redirect("/admin/login");
}

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const creds = adminCredentials();
  if (!creds) {
    return { error: "Редакция не настроена: задайте ADMIN_USER, ADMIN_PASSWORD и ADMIN_SESSION_SECRET." };
  }
  const user = String(formData.get("user") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!secretsMatch(user, creds.user) || !secretsMatch(password, creds.password)) {
    return { error: "Неверный логин или пароль." };
  }
  await startSession(creds.user);
  redirect("/admin");
}

export async function logout() {
  await clearSession();
  redirect("/admin/login");
}

function fail(base: string, error: string): never {
  redirect(`${base}?error=${encodeURIComponent(error)}`);
}

export async function saveArticleAction(formData: FormData) {
  await guard();
  const original = String(formData.get("originalSlug") ?? "");
  const back = original ? `/admin/articles/${original}` : "/admin/articles/new";
  if (formData.get("intent") === "delete") {
    if (original) deleteRecord("articles", original);
    publish();
    redirect("/admin/articles");
  }
  const parsed = parseArticle(formData);
  if (!parsed.ok) fail(back, parsed.error);
  try {
    saveArticle(parsed.value, original);
  } catch (error) {
    fail(back, error instanceof Error ? error.message : "Не удалось сохранить.");
  }
  publish();
  redirect(`/admin/articles/${parsed.value.slug}?saved=1`);
}

export async function saveServiceAction(formData: FormData) {
  await guard();
  const original = String(formData.get("originalSlug") ?? "");
  const back = original ? `/admin/services/${original}` : "/admin/services/new";
  if (formData.get("intent") === "delete") {
    if (original) deleteRecord("services", original);
    publish();
    redirect("/admin/services");
  }
  const parsed = parseService(formData);
  if (!parsed.ok) fail(back, parsed.error);
  try {
    saveService(parsed.value, original);
  } catch (error) {
    fail(back, error instanceof Error ? error.message : "Не удалось сохранить.");
  }
  publish();
  redirect(`/admin/services/${parsed.value.slug}?saved=1`);
}

export async function saveModelAction(formData: FormData) {
  await guard();
  const original = String(formData.get("originalSlug") ?? "");
  const back = original ? `/admin/models/${original}` : "/admin/models/new";
  if (formData.get("intent") === "delete") {
    if (original) deleteRecord("models", original);
    publish();
    redirect("/admin/models");
  }
  const parsed = parseModel(formData);
  if (!parsed.ok) fail(back, parsed.error);
  try {
    saveModel(parsed.value, original);
  } catch (error) {
    fail(back, error instanceof Error ? error.message : "Не удалось сохранить.");
  }
  publish();
  redirect(`/admin/models/${parsed.value.slug}?saved=1`);
}
