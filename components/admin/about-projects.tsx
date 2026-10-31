"use client";

import { useState } from "react";

import { CoverField } from "@/components/admin/cover-field";
import { Field, fieldClass } from "@/components/admin/ui";
import type { AboutProject } from "@/lib/about.shared";

export function AboutProjectsAdmin({
  projects,
  action,
}: {
  projects: AboutProject[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const current = editing && editing !== "new" ? projects.find((item) => item.id === editing) : null;

  return (
    <section className="grid max-w-4xl gap-6 border-t border-border pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl tracking-tight">Карточки проектов</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Обложка, название, описание. Ссылка необязательна — без неё карточка просто показывается на странице.
            Проект «Нижегородец Г6» уже задан в коде сайта и всегда виден на публичной витрине.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full bg-olive px-4 py-2 text-sm text-accent-foreground hover:bg-olive-deep"
          onClick={() => setEditing("new")}
        >
          Добавить проект
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">Пока нет карточек. Добавьте первый проект.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {projects.map((project, index) => (
            <li key={project.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
              <div className="flex min-w-0 gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.cover} alt="" className="aspect-video w-28 shrink-0 object-cover" />
                <div className="min-w-0">
                  <p className="font-heading text-xl">{project.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                  {project.url ? <p className="mt-1 truncate font-mono text-xs text-olive">{project.url}</p> : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <form action={action}>
                  <input type="hidden" name="intent" value="move" />
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" disabled={index === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-40">
                    Выше
                  </button>
                </form>
                <form action={action}>
                  <input type="hidden" name="intent" value="move" />
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={index === projects.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-40"
                  >
                    Ниже
                  </button>
                </form>
                <button type="button" className="text-olive" onClick={() => setEditing(project.id)}>
                  Изменить
                </button>
                <form action={action}>
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="id" value={project.id} />
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
          <h3 className="font-heading text-xl tracking-tight">{editing === "new" ? "Новый проект" : "Редактирование"}</h3>
          <form action={action} className="mt-5 grid gap-5">
            <input type="hidden" name="intent" value="save" />
            <input type="hidden" name="id" value={current?.id ?? ""} />
            <Field label="Название">
              <input name="title" defaultValue={current?.title ?? ""} required className={fieldClass} />
            </Field>
            <Field label="Описание">
              <textarea name="description" defaultValue={current?.description ?? ""} required rows={5} className={fieldClass} />
            </Field>
            <Field label="Ссылка (необязательно)">
              <input
                name="url"
                type="text"
                defaultValue={current?.url ?? ""}
                placeholder="https://… или /страница-сайта"
                className={fieldClass}
              />
            </Field>
            <CoverField preview={current?.cover ?? ""} />
            {!current ? <p className="text-sm text-muted-foreground">Для нового проекта обложка обязательна.</p> : null}
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep">
                Сохранить проект
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
