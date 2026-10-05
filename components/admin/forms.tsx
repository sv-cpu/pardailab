import { aiCategories } from "@/lib/categories";
import { scoreFields } from "@/lib/scores";
import type { ModelProfile, Service } from "@/lib/types";

import { ConfirmDelete } from "./delete-button";
import { Field, fieldClass } from "./ui";

export { ArticleForm } from "./article-form";

function Lines({ name, value }: { name: string; value: string[] }) {
  return <textarea name={name} defaultValue={value.join("\n")} rows={4} className={fieldClass} />;
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
