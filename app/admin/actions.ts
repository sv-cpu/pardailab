"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { clearSession, startSession } from "@/lib/auth";
import { parseArticle, parseModel, parseService } from "@/lib/admin-parse";
import { isStoredCover, removeCover, storeCover } from "@/lib/covers";
import { dropRemovedMedia } from "@/lib/media";
import { deleteRecord, listArticles, listModels, saveArticle, saveModel, saveService } from "@/lib/db";
import { saveBenchmark, deleteBenchmark, type BenchmarkRow } from "@/lib/benchmarks";
import { saveRatingStamp } from "@/lib/rating";
import { stampPublished } from "@/lib/format";
import { transliterate } from "@/lib/rubric-seed";
import { scoreFields } from "@/lib/scores";
import type { ModelScores } from "@/lib/types";
import { createRubric, deleteRubric, listRubrics, renameRubric } from "@/lib/rubrics";
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
  const parsed = parseArticle(formData);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const draft = parsed.value;
  const articles = listArticles();
  const existing = original ? articles.find((item) => item.slug === original) : undefined;
  if (original && !existing) return { ok: false, error: "Статья не найдена. Текст остался в форме." };
  if (existing && actor.role !== "editor" && !ownsArticle(existing, actor)) {
    return { ok: false, error: "Это не ваша статья." };
  }
  const rubrics = listRubrics();
  function placed(index: number): { error: string } | { parent: (typeof rubrics)[number]; child?: (typeof rubrics)[number] } | undefined {
    const placement = draft.placements?.[index];
    if (!placement) return undefined;
    const parent = rubrics.find((item) => item.slug === placement.rubric && !item.parent);
    if (!parent) return { error: index === 0 ? "Выберите рубрику." : "Вторая рубрика не найдена." };
    const child = placement.subrubric
      ? rubrics.find((item) => item.slug === placement.subrubric && item.parent === parent.slug)
      : undefined;
    if (placement.subrubric && !child) return { error: "Подрубрика не из этой рубрики." };
    return child ? { parent, child } : { parent };
  }
  const primary = placed(0);
  if (!primary) return { ok: false, error: "Выберите рубрику." };
  if ("error" in primary) return { ok: false, error: primary.error };
  const extra = placed(1);
  if (extra && "error" in extra) return { ok: false, error: extra.error };
  const rubric = primary.parent;
  const subrubric = "child" in primary ? primary.child : undefined;
  const secondary = extra && "parent" in extra ? extra : undefined;
  if (articles.some((item) => item.slug === draft.slug && item.slug !== original)) {
    return { ok: false, error: "Такой адрес уже есть. Измените название или поправьте адрес — текст на месте." };
  }
  const previous = isStoredCover(String(formData.get("existingCover") ?? ""))
    ? String(formData.get("existingCover"))
    : undefined;
  const upload = formData.get("coverFile");
  let uploaded: string | undefined;
  try {
    if (upload instanceof File && upload.size > 0) uploaded = await storeCover(upload);
    saveArticle(
      {
        ...draft,
        date: stampPublished(draft.date.slice(0, 10), draft.date.slice(11, 16), existing?.date),
        rubric: rubric.slug,
        subrubric: subrubric?.slug,
        placements: [
          { rubric: rubric.slug, ...(subrubric ? { subrubric: subrubric.slug } : {}) },
          ...(secondary
            ? [{ rubric: secondary.parent.slug, ...(secondary.child ? { subrubric: secondary.child.slug } : {}) }]
            : []),
        ],
        category: subrubric?.name ?? rubric.name,
        kind: rubric.kind ?? existing?.kind ?? "news",
        author: existing?.author ?? actor.name,
        ...(!existing || existing.authorSlug || ownsArticle(existing, actor)
          ? { authorSlug: existing?.authorSlug ?? actor.slug }
          : {}),
        cover: existing?.cover ?? parsed.value.cover,
        ...(existing?.whyItMatters ? { whyItMatters: existing.whyItMatters } : {}),
        ...(existing?.research ? { research: existing.research } : {}),
        ...((uploaded ?? previous) ? { coverImage: uploaded ?? previous } : {}),
      },
      original,
    );
  } catch (error) {
    if (uploaded) await removeCover(uploaded);
    return { ok: false, error: error instanceof Error ? error.message : "Не удалось сохранить." };
  }
  if (uploaded && previous && previous !== uploaded) await removeCover(previous);
  if (existing) await dropRemovedMedia(existing.body, draft.body);
  publish();
  return { ok: true, href: `/admin/articles/${parsed.value.slug}?saved=1` };
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
  const existing = original ? listModels().find((item) => item.slug === original) : undefined;
  try {
    saveModel({ ...parsed.value, inRating: existing?.inRating }, original);
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
    saveBenchmark(
      { slug, title: "Рейтинг AI-моделей", tested, nextUpdate, rows },
      original,
    );
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

async function readAvatar(formData: FormData) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size <= 0) return undefined;
  return storeAvatar(file);
}
