import { aiCategories } from "@/lib/categories";
import { blocksToHtml } from "@/lib/html";
import { kindLabel } from "@/lib/paths";
import { scoreFields } from "@/lib/scores";
import { site } from "@/lib/site";
import type { Article, ArticleKind, ModelProfile, Service } from "@/lib/types";

import { ArticleEditor } from "./article-editor";
import { CoverField } from "./cover-field";
import { ConfirmDelete } from "./delete-button";
import { Field, fieldClass } from "./ui";

const kinds = Object.entries(kindLabel) as [ArticleKind, string][];

function Lines({ name, value }: { name: string; value: string[] }) {
  return <textarea name={name} defaultValue={value.join("\n")} rows={4} className={fieldClass} />;
}

export function ArticleForm({
  article,
  action,
  publicHref,
}: {
  article?: Article;
  action: (formData: FormData) => void | Promise<void>;
  publicHref?: string;
}) {
  return (
    <form action={action} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <input type="hidden" name="originalSlug" defaultValue={article?.slug ?? ""} />
      <div className="grid gap-5">
        <Field label="Название">
          <input name="title" defaultValue={article?.title ?? ""} required className={`${fieldClass} font-heading text-2xl`} />
        </Field>
        <Field label="Описание">
          <textarea name="description" defaultValue={article?.description ?? ""} required rows={3} className={fieldClass} />
        </Field>
        <ArticleEditor initialHtml={article ? blocksToHtml(article.body) : "<p></p>"} />
      </div>
      <div className="grid gap-5 lg:sticky lg:top-6">
        <Field label="Раздел">
          <select name="kind" defaultValue={article?.kind ?? "news"} className={fieldClass}>
            {kinds.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Адрес">
          <input name="slug" defaultValue={article?.slug ?? ""} required className={fieldClass} />
        </Field>
        <Field label="Рубрика">
          <input name="category" defaultValue={article?.category ?? ""} required className={fieldClass} />
        </Field>
        <Field label="Дата">
          <input name="date" type="date" defaultValue={article?.date ?? new Date().toISOString().slice(0, 10)} required className={fieldClass} />
        </Field>
        <Field label="Автор">
          <input name="author" defaultValue={article?.author ?? site.author} required className={fieldClass} />
        </Field>
        <Field label="Минуты чтения">
          <input name="readingMinutes" type="number" min={1} max={180} defaultValue={article?.readingMinutes ?? 6} required className={fieldClass} />
        </Field>
        <Field label="Готовая обложка">
          <select name="cover" defaultValue={String(article?.cover ?? 0)} className={fieldClass}>
            {[0, 1, 2, 3, 4, 5].map((cover) => (
              <option key={cover} value={cover}>
                {cover}
              </option>
            ))}
          </select>
        </Field>
        <CoverField
          preview={article?.coverImage || `/covers/cover-${article?.cover ?? 0}.svg`}
          uploaded={Boolean(article?.coverImage)}
        />
        <input type="hidden" name="existingCover" value={article?.coverImage ?? ""} />
        <Field label="Номер исследования">
          <input name="researchNumber" type="number" min={1} defaultValue={article?.research?.number ?? ""} className={fieldClass} />
        </Field>
        <Field label="Тема исследования">
          <input name="researchTopic" defaultValue={article?.research?.topic ?? ""} className={fieldClass} />
        </Field>
        <Field label="Почему это важно">
          <textarea name="whyItMatters" defaultValue={article?.whyItMatters ?? ""} rows={3} className={fieldClass} />
        </Field>
        <Field label="Метки, по одной на строку">
          <Lines name="tags" value={article?.tags ?? []} />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" name="intent" value="save" className="rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep">
            Сохранить
          </button>
          {publicHref ? (
            <a href={publicHref} className="rounded-full border border-border px-5 py-2.5 text-sm hover:border-olive">
              Открыть на сайте
            </a>
          ) : null}
          {article ? <ConfirmDelete /> : null}
        </div>
      </div>
    </form>
  );
}

export function ServiceForm({
  service,
  action,
}: {
  service?: Service;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="grid max-w-3xl gap-5">
      <input type="hidden" name="originalSlug" defaultValue={service?.slug ?? ""} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Название">
          <input name="name" defaultValue={service?.name ?? ""} required className={fieldClass} />
        </Field>
        <Field label="Адрес">
          <input name="slug" defaultValue={service?.slug ?? ""} required className={fieldClass} />
        </Field>
        <Field label="Знак">
          <input name="mark" defaultValue={service?.mark ?? ""} maxLength={2} required className={fieldClass} />
        </Field>
        <Field label="Оценка">
          <input name="rating" type="number" min={0} max={10} step="0.1" defaultValue={service?.rating ?? 8} required className={fieldClass} />
        </Field>
      </div>
      <Field label="Описание">
        <textarea name="description" defaultValue={service?.description ?? ""} required rows={3} className={fieldClass} />
      </Field>
      <Field label="Цена">
        <textarea name="price" defaultValue={service?.price ?? ""} required rows={2} className={fieldClass} />
      </Field>
      <Field label="Сайт">
        <input name="website" type="url" defaultValue={service?.website ?? "https://"} required className={fieldClass} />
      </Field>
      <fieldset className="grid gap-3">
        <legend className="text-sm text-muted-foreground">Категории каталога</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {aiCategories.map((category) => (
            <label key={category.slug} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="categories" value={category.slug} defaultChecked={service?.categories.includes(category.slug)} />
              {category.label}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Плюсы">
        <Lines name="pros" value={service?.pros ?? []} />
      </Field>
      <Field label="Минусы">
        <Lines name="cons" value={service?.cons ?? []} />
      </Field>
      <Field label="Области">
        <Lines name="domains" value={service?.domains ?? []} />
      </Field>
      <Field label="Похожие, адреса сервисов">
        <Lines name="similar" value={service?.similar ?? []} />
      </Field>
      <Field label="Метки">
        <Lines name="tags" value={service?.tags ?? []} />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" name="intent" value="save" className="rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep">
          Сохранить
        </button>
        {service ? (
          <a href={`/resheniya/${service.slug}`} className="rounded-full border border-border px-5 py-2.5 text-sm hover:border-olive">
            Открыть на сайте
          </a>
        ) : null}
        {service ? <ConfirmDelete /> : null}
      </div>
    </form>
  );
}

export function ModelForm({
  model,
  action,
}: {
  model?: ModelProfile;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="grid max-w-3xl gap-5">
      <input type="hidden" name="originalSlug" defaultValue={model?.slug ?? ""} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Название">
          <input name="name" defaultValue={model?.name ?? ""} required className={fieldClass} />
        </Field>
        <Field label="Адрес">
          <input name="slug" defaultValue={model?.slug ?? ""} required className={fieldClass} />
        </Field>
        <Field label="Вендор">
          <input name="vendor" defaultValue={model?.vendor ?? ""} required className={fieldClass} />
        </Field>
      </div>
      <Field label="Кратко">
        <textarea name="summary" defaultValue={model?.summary ?? ""} required rows={3} className={fieldClass} />
      </Field>
      <Field label="Когда брать">
        <textarea name="bestFor" defaultValue={model?.bestFor ?? ""} required rows={2} className={fieldClass} />
      </Field>
      <Field label="Когда не брать">
        <textarea name="avoidWhen" defaultValue={model?.avoidWhen ?? ""} required rows={2} className={fieldClass} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        {scoreFields.map(([key, label]) => (
          <Field key={key} label={label}>
            <input name={key} type="number" min={0} max={10} step="0.1" defaultValue={model?.scores[key] ?? 8} required className={fieldClass} />
          </Field>
        ))}
      </div>
      <Field label="Метки">
        <Lines name="tags" value={model?.tags ?? []} />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" name="intent" value="save" className="rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep">
          Сохранить
        </button>
        {model ? (
          <a href={`/modeli/${model.slug}`} className="rounded-full border border-border px-5 py-2.5 text-sm hover:border-olive">
            Открыть на сайте
          </a>
        ) : null}
        {model ? <ConfirmDelete /> : null}
      </div>
    </form>
  );
}
