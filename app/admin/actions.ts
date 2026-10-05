"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { clearSession, startSession } from "@/lib/auth";
import { parseArticle, parseModel, parseService } from "@/lib/admin-parse";
import { isStoredCover, removeCover, storeCover } from "@/lib/covers";
import { deleteRecord, listArticles, listModels, saveArticle, saveModel, saveService } from "@/lib/db";
import { saveRatingStamp } from "@/lib/rating";
import { transliterate } from "@/lib/rubric-seed";
import { scoreFields } from "@/lib/scores";
import type { ModelScores } from "@/lib/types";
import { createRubric, deleteRubric, listRubrics, renameRubric } from "@/lib/rubrics";
import { authenticate, createUser, currentUser, deleteUser, findUserBySlug, ownsArticle, updateUser, type StaffRole } from "@/lib/users";
import { removeAvatar, storeAvatar } from "@/lib/avatars";

export type LoginState = { error?: string };

function publish() {
  updateTag("content");
  revalidatePath("/", "layout");
}

async function guard() {
  if (!(await currentUser())) redirect("/admin/login");
}

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const user = authenticate(String(formData.get("user") ?? ""), String(formData.get("password") ?? ""));
  if (!user) return { error: "Неверный логин или пароль." };
  await startSession(user.login);
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
    const actor = await currentUser();
    if (!actor) redirect("/admin/login");
    if (original) {
      const existing = listArticles().find((item) => item.slug === original);
      if (existing && actor.role !== "editor" && !ownsArticle(existing, actor)) fail(back, "Это не ваша статья.");
      await removeCover(existing?.coverImage);
      deleteRecord("articles", original);
    }
    publish();
    redirect("/admin/articles");
  }
  const actor = await currentUser();
  if (!actor) redirect("/admin/login");
  const parsed = parseArticle(formData);
  if (!parsed.ok) fail(back, parsed.error);
  const existing = original ? listArticles().find((item) => item.slug === original) : undefined;
  const previous = isStoredCover(String(formData.get("existingCover") ?? ""))
    ? String(formData.get("existingCover"))
    : undefined;
  let coverImage = previous;
  const upload = formData.get("coverFile");
  try {
    if (upload instanceof File && upload.size > 0) {
      coverImage = await storeCover(upload);
      if (previous && previous !== coverImage) await removeCover(previous);
    }
    if (existing && actor.role !== "editor" && !ownsArticle(existing, actor)) fail(back, "Это не ваша статья.");
    const rubrics = listRubrics();
    const rubric = rubrics.find((item) => item.slug === parsed.value.rubric && !item.parent);
    if (!rubric) fail(back, "Выберите рубрику.");
    const subSlug = parsed.value.subrubric;
    const subrubric = subSlug ? rubrics.find((item) => item.slug === subSlug && item.parent === rubric.slug) : undefined;
    if (subSlug && !subrubric) fail(back, "Подрубрика не из этой рубрики.");
    saveArticle(
      {
        ...parsed.value,
        rubric: rubric.slug,
        subrubric: subrubric?.slug,
        category: subrubric?.name ?? rubric.name,
        kind: rubric.kind ?? existing?.kind ?? "news",
        author: existing?.author ?? actor.name,
        ...(!existing || existing.authorSlug || ownsArticle(existing, actor)
          ? { authorSlug: existing?.authorSlug ?? actor.slug }
          : {}),
        cover: existing?.cover ?? parsed.value.cover,
        ...(existing?.whyItMatters ? { whyItMatters: existing.whyItMatters } : {}),
        ...(existing?.research ? { research: existing.research } : {}),
        ...(coverImage ? { coverImage } : {}),
      },
      original,
    );
  } catch (error) {
    fail(back, error instanceof Error ? error.message : "Не удалось сохранить.");
  }
  publish();
  redirect(`/admin/articles/${parsed.value.slug}?saved=1`);
}

export async function saveServiceAction(formData: FormData) {
  await editorOnly();
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
  await editorOnly();
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

export async function saveRubricAction(formData: FormData) {
  await editorOnly();
  const intent = String(formData.get("intent") ?? "");
  try {
    if (intent === "delete") {
      deleteRubric(String(formData.get("slug") ?? ""));
    } else if (intent === "rename") {
      renameRubric(String(formData.get("slug") ?? ""), String(formData.get("name") ?? ""));
    } else if (intent === "child") {
      createRubric(String(formData.get("name") ?? ""), String(formData.get("parent") ?? ""));
    } else {
      createRubric(String(formData.get("name") ?? ""), null);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось сохранить рубрику.";
    redirect(`/admin/rubrics?error=${encodeURIComponent(message)}`);
  }
  publish();
  redirect("/admin/rubrics?saved=1");
}

async function editorOnly() {
  const actor = await currentUser();
  if (!actor) redirect("/admin/login");
  if (actor.role !== "editor") redirect("/admin");
  return actor;
}

export async function saveUserAction(formData: FormData) {
  const actor = await editorOnly();
  const intent = String(formData.get("intent") ?? "");
  try {
    if (intent === "delete") {
      const slug = String(formData.get("slug") ?? "");
      const existing = findUserBySlug(slug);
      await removeAvatar(existing?.photo);
      deleteUser(slug, actor);
    } else if (intent === "update") {
      const slug = String(formData.get("slug") ?? "");
      const password = String(formData.get("password") ?? "");
      const photo = await readAvatar(formData);
      updateUser(slug, {
        name: String(formData.get("name") ?? ""),
        role: String(formData.get("role") ?? "") as StaffRole,
        bio: String(formData.get("bio") ?? ""),
        ...(password ? { password } : {}),
        ...(photo ? { photo } : {}),
      });
    } else {
      const photo = await readAvatar(formData);
      createUser({
        name: String(formData.get("name") ?? ""),
        login: String(formData.get("login") ?? ""),
        password: String(formData.get("password") ?? ""),
        role: String(formData.get("role") ?? "journalist") as StaffRole,
        bio: String(formData.get("bio") ?? ""),
        ...(photo ? { photo } : {}),
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось сохранить пользователя.";
    redirect(`/admin/users?error=${encodeURIComponent(message)}`);
  }
  publish();
  redirect("/admin/users?saved=1");
}

export async function saveProfileAction(formData: FormData) {
  const actor = await currentUser();
  if (!actor) redirect("/admin/login");
  try {
    const password = String(formData.get("password") ?? "");
    const photo = await readAvatar(formData);
    if (photo && actor.photo) await removeAvatar(actor.photo);
    updateUser(actor.slug, {
      name: String(formData.get("name") ?? ""),
      bio: String(formData.get("bio") ?? ""),
      ...(password ? { password } : {}),
      ...(photo ? { photo } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось сохранить профиль.";
    redirect(`/admin/profile?error=${encodeURIComponent(message)}`);
  }
  publish();
  redirect("/admin/profile?saved=1");
}

export async function saveRatingAction(formData: FormData) {
  await editorOnly();
  const updated = String(formData.get("updated") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(updated)) {
    redirect("/admin/models/rating?error=" + encodeURIComponent("Укажите дату шкалы."));
  }
  const nextUpdate = String(formData.get("nextUpdate") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nextUpdate)) {
    redirect("/admin/models/rating?error=" + encodeURIComponent("Укажите дату следующего обновления."));
  }
  const slugs = formData.getAll("modelSlug").map(String);
  try {
    const models = listModels();
    for (const slug of slugs) {
      const model = models.find((item) => item.slug === slug);
      if (!model) throw new Error("Модель не найдена.");
      const versionName = String(formData.get(`${slug}:version`) ?? "").trim();
      if (!versionName) throw new Error("Укажите полное название с версией.");
      const scores = {} as ModelScores;
      for (const [key, label] of scoreFields) {
        const value = Number(String(formData.get(`${slug}:${key}`) ?? "").replace(",", "."));
        if (!Number.isFinite(value) || value < 0 || value > 10) {
          throw new Error(`«${versionName}», ${label}: число от 0 до 10.`);
        }
        scores[key] = Math.round(value * 10) / 10;
      }
      saveModel({ ...model, name: versionName, versionName, scores, inRating: true }, model.slug);
    }
    saveRatingStamp(updated, nextUpdate);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось сохранить шкалу.";
    redirect(`/admin/models/rating?error=${encodeURIComponent(message)}`);
  }
  publish();
  redirect("/admin/models/rating?saved=1");
}

export async function addRatingModelAction(formData: FormData) {
  await editorOnly();
  const versionName = String(formData.get("versionName") ?? "").trim();
  const vendor = String(formData.get("vendor") ?? "").trim();
  const slug = transliterate(String(formData.get("slug") ?? ""));
  if (!versionName || !vendor || !slug) {
    redirect("/admin/models/rating?error=" + encodeURIComponent("Заполните название, вендора и адрес."));
  }
  const models = listModels();
  if (models.filter((model) => model.inRating !== false).length >= 10) {
    redirect("/admin/models/rating?error=" + encodeURIComponent("В рейтинге уже десять моделей. Сначала уберите одну."));
  }
  if (models.some((model) => model.slug === slug)) {
    redirect("/admin/models/rating?error=" + encodeURIComponent("Такой адрес уже есть."));
  }
  const scores = { speed: 5, cost: 5, quality: 5, russian: 5, code: 5, agents: 5, documents: 5, context: 5 };
  saveModel(
    {
      slug,
      name: versionName,
      versionName,
      vendor,
      summary: "Оценки стоят до завершения цикла испытаний лаборатории.",
      bestFor: "Уточняется после испытаний.",
      avoidWhen: "Уточняется после испытаний.",
      scores,
      tags: [slug],
      inRating: true,
    },
    "",
  );
  publish();
  redirect("/admin/models/rating?saved=1");
}

export async function dropRatingModelAction(formData: FormData) {
  await editorOnly();
  const slug = String(formData.get("slug") ?? "");
  const model = listModels().find((item) => item.slug === slug);
  if (!model) redirect("/admin/models/rating");
  saveModel({ ...model, inRating: false }, model.slug);
  publish();
  redirect("/admin/models/rating?saved=1");
}

async function readAvatar(formData: FormData) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size <= 0) return undefined;
  return storeAvatar(file);
}
