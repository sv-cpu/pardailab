import { dropRemovedMedia } from "@/lib/media";
import { isStoredCover, removeCover, storeCover } from "@/lib/covers";
import { stampPublished } from "@/lib/format";
import { parseArticle, parseModel, parseService } from "@/lib/admin-parse";
import { saveArticle, saveModel, saveService } from "@/lib/db";
import type { RubricRecord } from "@/lib/rubric-seed";
import type { Article, ModelProfile, Service } from "@/lib/types";

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function persistArticleDraft(input: {
  formData: FormData;
  original: string;
  actor: { name: string; role: string; slug: string };
  articles: Article[];
  rubrics: RubricRecord[];
}): Promise<{ ok: true; href: string } | { ok: false; error: string }> {
  const { formData, original, actor, articles, rubrics } = input;

  const parsed = parseArticle(formData);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const draft = parsed.value;
  const existing = original ? articles.find((item) => item.slug === original) : undefined;
  if (original && !existing) return { ok: false, error: "Статья не найдена. Текст остался в форме." };

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
          ...(secondary ? [{ rubric: secondary.parent.slug, ...(secondary.child ? { subrubric: secondary.child.slug } : {}) }] : []),
        ],
        category: subrubric?.name ?? rubric.name,
        kind: rubric.kind ?? existing?.kind ?? "news",
        author: existing?.author ?? actor.name,
        ...(!existing || existing.authorSlug || actor.role === "editor" ? { authorSlug: existing?.authorSlug ?? actor.slug } : {}),
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
  return { ok: true, href: `/admin/articles/${parsed.value.slug}?saved=1` };
}

export function persistServiceDraft(formData: FormData, original: string): SaveResult {
  const parsed = parseService(formData);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  try {
    saveService(parsed.value, original);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Не удалось сохранить." };
  }
}

export function persistModelDraft(formData: FormData, original: string): SaveResult {
  const parsed = parseModel(formData);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  try {
    saveModel(parsed.value, original);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Не удалось сохранить." };
  }
}
