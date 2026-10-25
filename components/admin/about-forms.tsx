"use client";

import Link from "next/link";
import { useState } from "react";

import { ArticleEditor } from "@/components/admin/article-editor";
import { CoverField } from "@/components/admin/cover-field";
import { Field, fieldClass } from "@/components/admin/ui";
import { aboutDirectionHref, ensureAboutHtml, type AboutDirection, type AboutLab } from "@/lib/about.shared";

export function AboutHubForm({
  about,
  action,
}: {
  about: AboutLab;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [body, setBody] = useState(() => ensureAboutHtml(about.body));
  const [methodBody, setMethodBody] = useState(() => ensureAboutHtml(about.methodBody));

  return (
    <form action={action} className="grid max-w-4xl gap-5">
      <input type="hidden" name="scope" value="hub" />
      <input type="hidden" name="body" value={body} />
      <input type="hidden" name="methodBody" value={methodBody} />
      <Field label="Надзаголовок">
        <input name="eyebrow" defaultValue={about.eyebrow} required className={fieldClass} />
      </Field>
      <Field label="Заголовок / бренд">
        <input name="title" defaultValue={about.title} required className={fieldClass} />
      </Field>
      <Field label="Коротко под заголовком">
        <textarea name="lede" defaultValue={about.lede} required rows={2} className={fieldClass} />
      </Field>
      <Field label="Слоган">
        <input name="slogan" defaultValue={about.slogan} required className={fieldClass} />
      </Field>
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">Основной текст</p>
        <ArticleEditor initialHtml={body} onChange={setBody} />
      </div>
      <CoverField preview={about.image ?? ""} />
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="removeImage" value="1" />
        Убрать изображение
      </label>
      <Field label="Заголовок блока метода">
        <input name="methodTitle" defaultValue={about.methodTitle} required className={fieldClass} />
      </Field>
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">Текст метода</p>
        <ArticleEditor initialHtml={methodBody} onChange={setMethodBody} />
      </div>
      <Field label="Заголовок формы связи">
        <input name="contactTitle" defaultValue={about.contactTitle} required className={fieldClass} />
      </Field>
      <Field label="Подзаголовок формы">
        <textarea name="contactLede" defaultValue={about.contactLede} required rows={2} className={fieldClass} />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep">
          Сохранить
        </button>
        <a href="/o-nas" className="rounded-full border border-border px-5 py-2.5 text-sm hover:border-olive">
          Открыть на сайте
        </a>
      </div>
    </form>
  );
}

export function AboutDirectionForm({
  direction,
  action,
}: {
  direction: AboutDirection;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [body, setBody] = useState(() => ensureAboutHtml(direction.body));

  return (
    <form action={action} className="grid max-w-4xl gap-5">
      <input type="hidden" name="scope" value="direction" />
      <input type="hidden" name="slug" value={direction.slug} />
      <input type="hidden" name="body" value={body} />
      <Field label="Название">
        <input name="title" defaultValue={direction.title} required className={fieldClass} />
      </Field>
      <Field label="Коротко на главной «О нас»">
        <textarea name="teaser" defaultValue={direction.teaser} required rows={2} className={fieldClass} />
      </Field>
      <Field label="Подзаголовок страницы">
        <textarea name="lede" defaultValue={direction.lede} required rows={2} className={fieldClass} />
      </Field>
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">Текст страницы</p>
        <ArticleEditor initialHtml={body} onChange={setBody} />
      </div>
      <CoverField preview={direction.image ?? ""} />
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="removeImage" value="1" />
        Убрать изображение
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep">
          Сохранить
        </button>
        <a
          href={aboutDirectionHref(direction.slug)}
          className="rounded-full border border-border px-5 py-2.5 text-sm hover:border-olive"
        >
          Открыть на сайте
        </a>
        <Link href="/admin/about" className="text-sm text-muted-foreground hover:text-foreground">
          Ко всем страницам
        </Link>
      </div>
    </form>
  );
}
