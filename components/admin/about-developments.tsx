"use client";

import { useState } from "react";

import { ArticleEditor } from "@/components/admin/article-editor";
import { CoverField } from "@/components/admin/cover-field";
import { Field, fieldClass } from "@/components/admin/ui";
import { ensureAboutHtml, type AboutDevelopment } from "@/lib/about.shared";

export function AboutDevelopmentsAdmin({
  developments,
  action,
}: {
  developments: AboutDevelopment[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const current = editing && editing !== "new" ? developments.find((item) => item.id === editing) : null;
  const [body, setBody] = useState("");

  function openEditor(next: string | "new") {
    const item = next !== "new" ? developments.find((entry) => entry.id === next) : null;
    setBody(ensureAboutHtml(item?.body ?? "<p></p>"));
    setEditing(next);
  }

  return (
    <section className="grid max-w-4xl gap-6 border-t border-border pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl tracking-tight">Карточки разработок</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Обложка, название и краткое описание на карточке. Полный текст открывается в окне на сайте — его правите
            визуальным редактором.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full bg-olive px-4 py-2 text-sm text-accent-foreground hover:bg-olive-deep"
          onClick={() => openEditor("new")}
        >
          Добавить разработку
        </button>
      </div>

      {developments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Пока нет карточек. Добавьте первую разработку.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {developments.map((item, index) => (
            <li key={item.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
              <div className="flex min-w-0 gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.cover} alt="" className="aspect-video w-28 shrink-0 object-cover" />
                <div className="min-w-0">
                  <p className="font-heading text-xl">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <form action={action}>
                  <input type="hidden" name="intent" value="move" />
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" disabled={index === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-40">
                    Выше
                  </button>
                </form>
                <form action={action}>
                  <input type="hidden" name="intent" value="move" />
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={index === developments.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-40"
                  >
                    Ниже
                  </button>
                </form>
                <button type="button" className="text-olive" onClick={() => openEditor(item.id)}>
                  Изменить
                </button>
                <form action={action}>
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="text-muted-foreground hover:text-foreground">
                    Удалить
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <div className="border border-border p-5">
          <h3 className="font-heading text-xl tracking-tight">{editing === "new" ? "Новая разработка" : "Редактирование"}</h3>
          <form action={action} className="mt-5 grid gap-5">
            <input type="hidden" name="intent" value="save" />
            <input type="hidden" name="id" value={current?.id ?? ""} />
            <input type="hidden" name="body" value={body} />
            <Field label="Название">
              <input name="title" defaultValue={current?.title ?? ""} required className={fieldClass} />
            </Field>
            <Field label="Краткое описание на карточке">
              <textarea name="summary" defaultValue={current?.summary ?? ""} required rows={3} className={fieldClass} />
            </Field>
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">Полное описание (окно на сайте)</p>
              <ArticleEditor key={`${editing}-${current?.id ?? "new"}`} initialHtml={body} onChange={setBody} />
            </div>
            <CoverField preview={current?.cover ?? ""} />
            {!current ? <p className="text-sm text-muted-foreground">Для новой разработки обложка обязательна.</p> : null}
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep">
                Сохранить разработку
              </button>
              <button type="button" className="text-sm text-muted-foreground" onClick={() => setEditing(null)}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
