"use server";

import { storeArticleMedia } from "@/lib/media";
import { currentUser } from "@/lib/users";

export type UploadMediaResult =
  | { ok: true; url: string; kind: "image" | "video" }
  | { ok: false; error: string };

export async function uploadArticleMedia(formData: FormData): Promise<UploadMediaResult> {
  const actor = await currentUser();
  if (!actor) return { ok: false, error: "Нужно войти в редакцию." };
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Файл не выбран." };
  try {
    const stored = await storeArticleMedia(file);
    return { ok: true, url: stored.url, kind: stored.kind };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Не удалось загрузить файл." };
  }
}
