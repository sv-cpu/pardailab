"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { clearSession, startSession } from "@/lib/auth";
import { persistArticleDraft, persistModelDraft, persistServiceDraft } from "@/lib/admin-service";
import { parseArticle, parseModel, parseService } from "@/lib/admin-parse";
import {
  aboutDirectionSlugs,
  getAboutLab,
  normalizeAboutLab,
  normalizeDevelopment,
  normalizeDevelopments,
  normalizeProject,
  normalizeProjects,
  saveAboutLab,
  type AboutDevelopment,
  type AboutDirectionSlug,
  type AboutLab,
  type AboutProject,
} from "@/lib/about";
import { removeCover, storeCover } from "@/lib/covers";
import { dropRemovedMedia } from "@/lib/media";
import { deleteRecord, listArticles, listModels, saveArticle, saveModel, saveService } from "@/lib/db";
import { saveBenchmark, deleteBenchmark, type BenchmarkRow } from "@/lib/benchmarks";
import { saveRatingStamp } from "@/lib/rating";
import { stampPublished } from "@/lib/format";
import { transliterate } from "@/lib/rubric-seed";
import { scoreFields } from "@/lib/scores";
import type { ModelScores } from "@/lib/types";
import { createRubric, deleteRubric, listRubrics, moveRubric, renameRubric } from "@/lib/rubrics";
import { verifyPassword } from "@/lib/passwords";
import { authenticate, createUser, currentUser, deleteUser, findUserBySlug, ownsArticle, updateUser, type StaffRole } from "@/lib/users";
import { removeAvatar, storeAvatar } from "@/lib/avatars";

export type LoginState = { error?: string };

function publish() {
  updateTag("content");
  revalidatePath("/", "layout");
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

export type SaveArticleResult = { ok: true; href: string } | { ok: false; error: string };

export async function saveArticleAction(formData: FormData): Promise<SaveArticleResult> {
  const actor = await currentUser();
  if (!actor) redirect("/admin/login");
  const original = String(formData.get("originalSlug") ?? "");
  if (formData.get("intent") === "delete") {
    if (original) {
      const existing = listArticles().find((item) => item.slug === original);
      if (existing && actor.role !== "editor" && !ownsArticle(existing, actor)) {
        return { ok: false, error: "Это не ваша статья." };
      }
      await removeCover(existing?.coverImage);
      if (existing) await dropRemovedMedia(existing.body, []);
      deleteRecord("articles", original);
    }
    publish();
    return { ok: true, href: "/admin/articles" };
  }

  const articles = listArticles();
  const existing = original ? articles.find((item) => item.slug === original) : undefined;
  if (existing && actor.role !== "editor" && !ownsArticle(existing, actor)) {
    return { ok: false, error: "Это не ваша статья." };
  }

  const rubrics = listRubrics();
  const result = await persistArticleDraft({
    formData,
    original,
    actor,
    articles,
    rubrics,
  });

  if (!result.ok) return result;
  publish();
  return result;
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

  const result = persistServiceDraft(formData, original);
  if (!result.ok) fail(back, result.error);
  publish();
  redirect(`/admin/services/${String(formData.get("slug") ?? "")}?saved=1`);
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

  const existing = original ? listModels().find((item) => item.slug === original) : undefined;
  const result = persistModelDraft(formData, original);
  if (!result.ok) fail(back, result.error);
  publish();
  redirect(`/admin/models/${String(formData.get("slug") ?? existing?.slug ?? "")}?saved=1`);
}

export async function saveRubricAction(formData: FormData) {
  await editorOnly();
  const intent = String(formData.get("intent") ?? "");
  try {
    if (intent === "delete") {
      deleteRubric(String(formData.get("slug") ?? ""));
    } else if (intent === "rename") {
      renameRubric(String(formData.get("slug") ?? ""), String(formData.get("name") ?? ""));
    } else if (intent === "move") {
      const direction = String(formData.get("direction") ?? "");
      if (direction !== "up" && direction !== "down") throw new Error("Не удалось изменить порядок.");
      moveRubric(String(formData.get("slug") ?? ""), direction);
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
      const existing = findUserBySlug(slug);
      const photo = await readAvatar(formData);
      const remove = formData.get("removePhoto") === "1";
      updateUser(slug, {
        name: String(formData.get("name") ?? ""),
        role: String(formData.get("role") ?? "") as StaffRole,
        bio: String(formData.get("bio") ?? ""),
        ...(password ? { password } : {}),
        ...(photo ? { photo } : remove ? { photo: null } : {}),
      });
      if ((photo || remove) && existing?.photo && existing.photo !== photo) await removeAvatar(existing.photo);
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
    const name = String(formData.get("name") ?? "").trim();
    if (!name) throw new Error("Введите имя.");
    const photo = await readAvatar(formData);
    const remove = formData.get("removePhoto") === "1";
    updateUser(actor.slug, {
      name,
      bio: String(formData.get("bio") ?? ""),
      ...(photo ? { photo } : remove ? { photo: null } : {}),
    });
    if ((photo || remove) && actor.photo && actor.photo !== photo) await removeAvatar(actor.photo);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось сохранить профиль.";
    redirect(`/admin/profile?error=${encodeURIComponent(message)}`);
  }
  publish();
  redirect("/admin/profile?saved=1");
}

export async function savePasswordAction(formData: FormData) {
  const actor = await currentUser();
  if (!actor) redirect("/admin/login");
  try {
    const current = String(formData.get("currentPassword") ?? "");
    const next = String(formData.get("password") ?? "");
    const again = String(formData.get("passwordAgain") ?? "");
    if (!verifyPassword(current, actor.passwordHash)) throw new Error("Текущий пароль не подошёл.");
    if (next.length < 8) throw new Error("Новый пароль — не короче 8 знаков.");
    if (next !== again) throw new Error("Новый пароль и повтор не совпадают.");
    updateUser(actor.slug, { name: actor.name, bio: actor.bio, password: next });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось сменить пароль.";
    redirect(`/admin/profile?error=${encodeURIComponent(message)}`);
  }
  publish();
  redirect("/admin/profile?saved=password");
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
      saveModel({ ...model, versionName, scores, inRating: true }, model.slug);
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

export async function saveBenchmarkAction(formData: FormData) {
  await editorOnly();
  const original = String(formData.get("originalSlug") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();
  const tested = String(formData.get("tested") ?? "");
  const nextUpdate = String(formData.get("nextUpdate") ?? "");
  const back = original ? `/admin/benchmarks/${original}` : "/admin/benchmarks/new";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    redirect(`${back}?error=` + encodeURIComponent("Адрес — латиница, цифры и дефисы."));
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tested) || !/^\d{4}-\d{2}-\d{2}$/.test(nextUpdate)) {
    redirect(`${back}?error=` + encodeURIComponent("Укажите обе даты."));
  }
  try {
    const rows: BenchmarkRow[] = [];
    for (let index = 0; index < 10; index += 1) {
      const versionName = String(formData.get(`row-${index}-version`) ?? "").trim();
      if (!versionName) throw new Error(`Строка ${index + 1}: укажите полное название с версией.`);
      const scores = {} as ModelScores;
      for (const [key, label] of scoreFields) {
        const value = Number(String(formData.get(`row-${index}-${key}`) ?? "").replace(",", "."));
        if (!Number.isFinite(value) || value < 0 || value > 10) {
          throw new Error(`«${versionName}», ${label}: число от 0 до 10.`);
        }
        scores[key] = Math.round(value * 10) / 10;
      }
      rows.push({
        modelSlug: String(formData.get(`row-${index}-model`) ?? ""),
        versionName,
        vendor: String(formData.get(`row-${index}-vendor`) ?? "").trim(),
        scores,
      });
    }
    saveBenchmark({ slug, title: "Рейтинг AI-моделей", tested, nextUpdate, rows }, original);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось сохранить выпуск.";
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }
  publish();
  redirect(`/admin/benchmarks/${slug}?saved=1`);
}

export async function deleteBenchmarkAction(formData: FormData) {
  await editorOnly();
  deleteBenchmark(String(formData.get("slug") ?? ""));
  publish();
  redirect("/admin/benchmarks?saved=1");
}

async function readCover(formData: FormData) {
  const file = formData.get("coverFile");
  if (!(file instanceof File) || file.size <= 0) return undefined;
  return storeCover(file);
}

export async function saveAboutAction(formData: FormData) {
  await editorOnly();
  const scope = String(formData.get("scope") ?? "");
  const current = getAboutLab();
  const removeImage = formData.get("removeImage") === "1";

  try {
    if (scope === "hub") {
      const image = await readCover(formData);
      const next: AboutLab = normalizeAboutLab({
        ...current,
        eyebrow: String(formData.get("eyebrow") ?? ""),
        title: String(formData.get("title") ?? ""),
        lede: String(formData.get("lede") ?? ""),
        slogan: String(formData.get("slogan") ?? ""),
        body: String(formData.get("body") ?? ""),
        methodTitle: String(formData.get("methodTitle") ?? ""),
        methodBody: String(formData.get("methodBody") ?? ""),
        contactTitle: String(formData.get("contactTitle") ?? ""),
        contactLede: String(formData.get("contactLede") ?? ""),
        image: image ?? (removeImage ? undefined : current.image),
        directions: current.directions,
      });
      if ((image || removeImage) && current.image && current.image !== next.image) await removeCover(current.image);
      saveAboutLab(next);
      publish();
      redirect("/admin/about?saved=1");
    }

    if (scope === "direction") {
      const slug = String(formData.get("slug") ?? "") as AboutDirectionSlug;
      if (!(aboutDirectionSlugs as readonly string[]).includes(slug)) {
        redirect("/admin/about?error=" + encodeURIComponent("Неизвестное направление."));
      }
      const image = await readCover(formData);
      const existing = current.directions.find((item) => item.slug === slug);
      const next = normalizeAboutLab({
        ...current,
        directions: current.directions.map((item) =>
          item.slug === slug
            ? {
                ...item,
                title: String(formData.get("title") ?? ""),
                teaser: String(formData.get("teaser") ?? ""),
                lede: String(formData.get("lede") ?? ""),
                body: String(formData.get("body") ?? ""),
                image: image ?? (removeImage ? undefined : item.image),
              }
            : item,
        ),
      });
      const updated = next.directions.find((item) => item.slug === slug);
      if ((image || removeImage) && existing?.image && existing.image !== updated?.image) {
        await removeCover(existing.image);
      }
      saveAboutLab(next);
      publish();
      redirect(`/admin/about/${slug}?saved=1`);
    }
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    const message = error instanceof Error ? error.message : "Не удалось сохранить страницу.";
    const back = scope === "direction" ? `/admin/about/${String(formData.get("slug") ?? "")}` : "/admin/about";
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin/about?error=" + encodeURIComponent("Нечего сохранять."));
}

export async function saveAboutProjectAction(formData: FormData) {
  await editorOnly();
  const back = "/admin/about/proekty";
  const intent = String(formData.get("intent") ?? "save");
  const current = getAboutLab();
  let projects = [...current.projects];

  try {
    if (intent === "delete") {
      const id = String(formData.get("id") ?? "");
      const removed = projects.find((item) => item.id === id);
      projects = projects.filter((item) => item.id !== id);
      if (removed?.cover) await removeCover(removed.cover);
      saveAboutLab({ ...current, projects: normalizeProjects(projects) });
      publish();
      redirect(`${back}?saved=1`);
    }

    if (intent === "move") {
      const id = String(formData.get("id") ?? "");
      const direction = String(formData.get("direction") ?? "");
      const index = projects.findIndex((item) => item.id === id);
      if (index < 0) redirect(`${back}?error=${encodeURIComponent("Проект не найден.")}`);
      const swap = direction === "up" ? index - 1 : index + 1;
      if (swap < 0 || swap >= projects.length) redirect(back);
      const copy = [...projects];
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
      saveAboutLab({ ...current, projects: normalizeProjects(copy) });
      publish();
      redirect(`${back}?saved=1`);
    }

    if (intent === "save") {
      const id = String(formData.get("id") ?? "").trim() || randomUUID();
      const existing = projects.find((item) => item.id === id);
      const uploaded = await readCover(formData);
      const cover = uploaded ?? existing?.cover ?? "";
      const draft: AboutProject = {
        id,
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        cover,
        url: String(formData.get("url") ?? "") || undefined,
      };
      const project = normalizeProject(draft);
      if (!project) {
        redirect(`${back}?error=${encodeURIComponent("Нужны название, описание и обложка (JPEG, PNG или WebP).")}`);
      }
      if (existing) {
        projects = projects.map((item) => (item.id === id ? project : item));
        if (uploaded && existing.cover && existing.cover !== project.cover) await removeCover(existing.cover);
      } else {
        projects = [...projects, project];
      }
      saveAboutLab({ ...current, projects: normalizeProjects(projects) });
      publish();
      redirect(`${back}?saved=1`);
    }
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    const message = error instanceof Error ? error.message : "Не удалось сохранить проект.";
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }

  redirect(`${back}?error=${encodeURIComponent("Нечего сохранять.")}`);
}

export async function saveAboutDevelopmentAction(formData: FormData) {
  await editorOnly();
  const back = "/admin/about/razrabotki";
  const intent = String(formData.get("intent") ?? "save");
  const current = getAboutLab();
  let developments = [...current.developments];

  try {
    if (intent === "delete") {
      const id = String(formData.get("id") ?? "");
      const removed = developments.find((item) => item.id === id);
      developments = developments.filter((item) => item.id !== id);
      if (removed?.cover) await removeCover(removed.cover);
      saveAboutLab({ ...current, developments: normalizeDevelopments(developments) });
      publish();
      redirect(`${back}?saved=1`);
    }

    if (intent === "move") {
      const id = String(formData.get("id") ?? "");
      const direction = String(formData.get("direction") ?? "");
      const index = developments.findIndex((item) => item.id === id);
      if (index < 0) redirect(`${back}?error=${encodeURIComponent("Разработка не найдена.")}`);
      const swap = direction === "up" ? index - 1 : index + 1;
      if (swap < 0 || swap >= developments.length) redirect(back);
      const copy = [...developments];
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
      saveAboutLab({ ...current, developments: normalizeDevelopments(copy) });
      publish();
      redirect(`${back}?saved=1`);
    }

    if (intent === "save") {
      const id = String(formData.get("id") ?? "").trim() || randomUUID();
      const existing = developments.find((item) => item.id === id);
      const uploaded = await readCover(formData);
      const cover = uploaded ?? existing?.cover ?? "";
      const draft: AboutDevelopment = {
        id,
        title: String(formData.get("title") ?? ""),
        summary: String(formData.get("summary") ?? ""),
        body: String(formData.get("body") ?? ""),
        cover,
      };
      const development = normalizeDevelopment(draft);
      if (!development) {
        redirect(
          `${back}?error=${encodeURIComponent("Нужны название, краткое описание, полный текст и обложка (JPEG, PNG или WebP).")}`,
        );
      }
      if (existing) {
        developments = developments.map((item) => (item.id === id ? development : item));
        if (uploaded && existing.cover && existing.cover !== development.cover) await removeCover(existing.cover);
      } else {
        developments = [...developments, development];
      }
      saveAboutLab({ ...current, developments: normalizeDevelopments(developments) });
      publish();
      redirect(`${back}?saved=1`);
    }
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    const message = error instanceof Error ? error.message : "Не удалось сохранить разработку.";
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }

  redirect(`${back}?error=${encodeURIComponent("Нечего сохранять.")}`);
}

async function readAvatar(formData: FormData) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size <= 0) return undefined;
  return storeAvatar(file);
}
