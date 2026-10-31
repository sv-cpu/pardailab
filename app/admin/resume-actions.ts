"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { removeAvatar, storeAvatar } from "@/lib/avatars";
import {
  canManageResume,
  createResume,
  deleteResume,
  findResumeById,
  normalizeResume,
  rotateResumeToken,
  sampleResumeInput,
  updateResume,
} from "@/lib/resumes";
import { currentUser, listUsers } from "@/lib/users";

function fail(base: string, error: string): never {
  redirect(`${base}?error=${encodeURIComponent(error)}`);
}

function readPayload(formData: FormData) {
  const raw = String(formData.get("payload") ?? "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Не удалось прочитать данные формы.");
  }
  return parsed;
}

async function readPhoto(formData: FormData) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size <= 0) return undefined;
  return storeAvatar(file);
}

export async function saveResumeAction(formData: FormData) {
  const actor = await currentUser();
  if (!actor) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "save");
  const back = id ? `/admin/resumes/${id}` : "/admin/resumes/new";

  if (intent === "delete") {
    if (!id) redirect("/admin/resumes");
    const existing = findResumeById(id);
    if (!existing) fail("/admin/resumes", "Резюме не найдено.");
    if (!canManageResume(existing, actor)) fail("/admin/resumes", "Это не ваше резюме.");
    deleteResume(id);
    await removeAvatar(existing.photo);
    revalidatePath("/admin/resumes");
    redirect("/admin/resumes?saved=1");
  }

  if (intent === "rotate") {
    if (!id) fail("/admin/resumes", "Резюме не найдено.");
    const existing = findResumeById(id);
    if (!existing) fail("/admin/resumes", "Резюме не найдено.");
    if (!canManageResume(existing, actor)) fail(back, "Это не ваше резюме.");
    rotateResumeToken(id);
    revalidatePath("/admin/resumes");
    revalidatePath(back);
    redirect(`${back}?saved=link`);
  }

  try {
    const parsed = readPayload(formData);
    const photo = await readPhoto(formData);
    const removePhoto = formData.get("removePhoto") === "1";

    if (id) {
      const existing = findResumeById(id);
      if (!existing) fail("/admin/resumes", "Резюме не найдено.");
      if (!canManageResume(existing, actor)) fail(back, "Это не ваше резюме.");
      const ownerSlug =
        actor.role === "editor" ? String(formData.get("ownerSlug") || existing.ownerSlug) : existing.ownerSlug;
      updateResume(id, { ...asInput(parsed), ownerSlug }, undefined, photo ? photo : removePhoto ? null : undefined);
      if ((photo || removePhoto) && existing.photo && existing.photo !== photo) await removeAvatar(existing.photo);
      revalidatePath("/admin/resumes");
      revalidatePath(`/admin/resumes/${id}`);
      redirect(`/admin/resumes/${id}?saved=1`);
    }

    const ownerSlug = actor.role === "editor" ? String(formData.get("ownerSlug") || actor.slug) : actor.slug;
    const created = createResume(asInput(parsed), ownerSlug, undefined, photo);
    revalidatePath("/admin/resumes");
    redirect(`/admin/resumes/${created.id}?saved=1`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось сохранить резюме.";
    fail(back, message);
  }
}

export async function createSampleResumeAction() {
  const actor = await currentUser();
  if (!actor) redirect("/admin/login");
  if (actor.role !== "editor") redirect("/admin/resumes");

  const users = listUsers();
  const owner =
    users.find((item) => /вихарев/i.test(item.name)) ??
    users.find((item) => item.role === "editor") ??
    actor;
  const created = createResume(sampleResumeInput(), owner.slug);
  revalidatePath("/admin/resumes");
  redirect(`/admin/resumes/${created.id}?saved=1`);
}

function asInput(parsed: unknown) {
  const resume = normalizeResume({ ...(parsed as object), ownerSlug: "form" });
  return {
    person: resume.person,
    jobs: resume.jobs,
    education: resume.education,
    skills: resume.skills,
    languages: resume.languages,
    driving: resume.driving,
    about: resume.about,
  };
}
