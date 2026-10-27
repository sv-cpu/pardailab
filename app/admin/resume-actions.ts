"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
    if (id) {
      const existing = findResumeById(id);
      if (!existing) fail("/admin/resumes", "Резюме не найдено.");
      if (!canManageResume(existing, actor)) fail(back, "Это не ваше резюме.");
      const ownerSlug =
        actor.role === "editor" ? String(formData.get("ownerSlug") || existing.ownerSlug) : existing.ownerSlug;
      updateResume(id, { ...asInput(parsed), ownerSlug });
      revalidatePath("/admin/resumes");
      revalidatePath(`/admin/resumes/${id}`);
      redirect(`/admin/resumes/${id}?saved=1`);
    }

    const ownerSlug = actor.role === "editor" ? String(formData.get("ownerSlug") || actor.slug) : actor.slug;
    const created = createResume(asInput(parsed), ownerSlug);
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
    target: resume.target,
    experienceLabel: resume.experienceLabel,
    jobs: resume.jobs,
    education: resume.education,
    skills: resume.skills,
    languages: resume.languages,
    driving: resume.driving,
    about: resume.about,
  };
}
