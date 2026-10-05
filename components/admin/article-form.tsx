"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import type { SaveArticleResult } from "@/app/admin/actions";
import { articleHref } from "@/lib/paths";
import { transliterate, type RubricRecord } from "@/lib/rubric-seed";
import type { Article } from "@/lib/types";

import { clearDraft, readDraft, writeDraft, type ArticleDraft } from "./article-draft";
import { ArticleEditor } from "./article-editor";
import { CoverField } from "./cover-field";
import { ConfirmDelete } from "./delete-button";
import { RubricFields } from "./rubric-fields";
import { Field, fieldClass } from "./ui";

type Fields = Omit<ArticleDraft, "savedAt" | "slugTouched">;

function same(left: Fields, right: Fields) {
  return (
    left.title === right.title &&
    left.slug === right.slug &&
    left.description === right.description &&
    left.rubric === right.rubric &&
    left.subrubric === right.subrubric &&
    left.date === right.date &&
    left.tags === right.tags &&
    left.bodyHtml === right.bodyHtml
  );
}

function redirectError(error: unknown) {
  return typeof error === "object" && error !== null && "digest" in error && String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT");
}

export function ArticleForm({
  article,
  rubrics,
  action,
  publicHref,
  initialDate,
  initialHtml,
}: {
  article?: Article;
  rubrics: RubricRecord[];
  action: (formData: FormData) => Promise<SaveArticleResult>;
  publicHref?: string;
  initialDate: string;
  initialHtml: string;
}) {
  const router = useRouter();
  const draftSlug = article?.slug ?? "";
  const baseline = useMemo<Fields>(
    () => ({
      title: article?.title ?? "",
      slug: article?.slug ?? "",
      description: article?.description ?? "",
      rubric: article?.rubric ?? "",
      subrubric: article?.subrubric ?? "",
      date: article?.date ?? initialDate,
      tags: article?.tags.join("\n") ?? "",
      bodyHtml: initialHtml,
    }),
    [article, initialDate, initialHtml],
  );
  const [fields, setFields] = useState<Fields>(baseline);
  const [slugTouched, setSlugTouched] = useState(Boolean(article?.slug));
  const [editorKey, setEditorKey] = useState("saved");
  const [banner, setBanner] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const leaving = useRef(false);
  const restored = useRef(false);
  const draftTimer = useRef<number | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const stored = readDraft(draftSlug);
    if (!stored) return;
    const next: Fields = {
      title: stored.title,
      slug: stored.slug,
      description: stored.description,
      rubric: stored.rubric,
      subrubric: stored.subrubric,
      date: stored.date || baseline.date,
      tags: stored.tags,
      bodyHtml: stored.bodyHtml,
    };
    if (same(next, baseline)) {
      clearDraft(draftSlug);
      return;
    }
    setFields(next);
    setSlugTouched(stored.slugTouched);
    setEditorKey(`draft-${stored.savedAt}`);
    setBanner(
      article
        ? "Восстановлен несохранённый черновик. На сайте ничего не изменилось, пока вы не нажмёте «Сохранить»."
        : "Восстановлен черновик из этого браузера. Он не пропал после прошлой попытки.",
    );
  }, [article, baseline, draftSlug]);

  const dirty = !same(fields, baseline) || slugTouched !== Boolean(article?.slug);

  useEffect(() => {
    if (!dirty) return;
    const draft: ArticleDraft = { ...fields, slugTouched, savedAt: Date.now() };
    draftTimer.current = window.setTimeout(() => {
      writeDraft(draftSlug, draft);
      setDraftNote("Черновик записан в браузер и переживёт ошибку сохранения. Файл обложки остаётся, пока вкладка открыта.");
    }, 400);
    return () => {
      if (draftTimer.current) window.clearTimeout(draftTimer.current);
    };
  }, [dirty, draftSlug, fields, slugTouched]);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty || leaving.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ block: "center" });
  }, [error]);

  function patch(next: Partial<Fields>) {
    setFields((current) => ({ ...current, ...next }));
  }

  function onTitle(title: string) {
    setFields((current) => ({
      ...current,
      title,
      slug: slugTouched ? current.slug : transliterate(title),
    }));
  }

  function onSlug(slug: string) {
    if (!slug.trim()) {
      setSlugTouched(false);
      setFields((current) => ({ ...current, slug: transliterate(current.title) }));
      return;
    }
    setSlugTouched(true);
    patch({ slug });
  }

  function discardDraft() {
    clearDraft(draftSlug);
    setFields(baseline);
    setSlugTouched(Boolean(article?.slug));
    setEditorKey(`reset-${Date.now()}`);
    setBanner("");
    setDraftNote("");
    setError("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const data = new FormData(event.currentTarget, submitter);
    setError("");
    setPending(true);
    try {
      const result = await action(data);
      if (!result.ok) {
        setError(result.error);
        setPending(false);
        return;
      }
      if (draftTimer.current) window.clearTimeout(draftTimer.current);
      clearDraft(draftSlug);
      leaving.current = true;
      router.push(result.href);
      router.refresh();
    } catch (reason) {
      if (redirectError(reason)) throw reason;
      setError(reason instanceof Error ? reason.message : "Не удалось сохранить. Текст остался в форме.");
      setPending(false);
    }
  }

  const parent = rubrics.find((item) => item.slug === fields.rubric && !item.parent);
  const preview = fields.slug ? articleHref(parent?.kind ?? "news", fields.slug) : "";

  return (
    <form onSubmit={onSubmit} className="mx-auto grid w-full min-w-0 max-w-3xl gap-5" autoComplete="off">
      <input type="hidden" name="originalSlug" value={article?.slug ?? ""} />
      <input type="hidden" name="bodyHtml" value={fields.bodyHtml} />
      {banner ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-olive-soft px-4 py-3 text-sm text-olive-deep">
          <p>{banner}</p>
          <button type="button" className="underline" onClick={discardDraft}>
            {article ? "Вернуть сохранённую версию" : "Очистить черновик"}
          </button>
        </div>
      ) : null}
      {error ? (
        <p ref={errorRef} role="alert" className="rounded-xl bg-olive-soft px-4 py-3 text-sm text-olive-deep">
          {error} Текст, адрес и обложка в форме сохранены.
        </p>
      ) : null}
      <Field label="Название">
        <input
          name="title"
          value={fields.title}
          required
          onChange={(event) => onTitle(event.target.value)}
          className={`${fieldClass} font-heading text-2xl`}
        />
      </Field>
      <Field label="Адрес">
        <input
          name="slug"
          value={fields.slug}
          onChange={(event) => onSlug(event.target.value)}
          onBlur={() => {
            const next = transliterate(fields.slug);
            if (next && next !== fields.slug) patch({ slug: next });
          }}
          className={fieldClass}
          spellCheck={false}
        />
        <span className="text-sm text-muted-foreground">
          {preview ? preview : "Появится из названия."}
          {slugTouched ? " Адрес правится вручную и больше не следует за названием." : " Собирается из названия, пока вы его не поправите."}
        </span>
      </Field>
      <Field label="Описание">
        <textarea
          name="description"
          value={fields.description}
          required
          rows={3}
          onChange={(event) => patch({ description: event.target.value })}
          className={fieldClass}
        />
      </Field>
      <div className="grid gap-5">
        <RubricFields
          rubrics={rubrics}
          rubric={fields.rubric}
          subrubric={fields.subrubric}
          onRubric={(rubric) => patch({ rubric, subrubric: "" })}
          onSubrubric={(subrubric) => patch({ subrubric })}
        />
      </div>
      <Field label="Дата">
        <input name="date" type="date" value={fields.date} required onChange={(event) => patch({ date: event.target.value })} className={fieldClass} />
      </Field>
      <CoverField preview={article?.coverImage ?? ""} />
      <input type="hidden" name="existingCover" value={article?.coverImage ?? ""} />
      <Field label="Метки">
        <textarea
          name="tags"
          value={fields.tags}
          rows={4}
          onChange={(event) => patch({ tags: event.target.value })}
          placeholder="Необязательно. По одной на строку или через запятую."
          className={fieldClass}
        />
      </Field>
      <ArticleEditor key={editorKey} initialHtml={fields.bodyHtml} onChange={(bodyHtml) => patch({ bodyHtml })} />
      {draftNote ? <p className="text-sm text-muted-foreground">{draftNote}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          name="intent"
          value="save"
          disabled={pending}
          className="rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep disabled:opacity-60"
        >
          {pending ? "Сохраняем…" : "Сохранить"}
        </button>
        {publicHref ? (
          <a href={publicHref} className="rounded-full border border-border px-5 py-2.5 text-sm hover:border-olive">
            Открыть на сайте
          </a>
        ) : null}
        {article ? <ConfirmDelete /> : null}
      </div>
    </form>
  );
}
