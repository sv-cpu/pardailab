"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";

import {
  createRubricAction,
  deleteRubricAction,
  moveRubricAction,
  renameRubricAction,
  type RubricActionResult,
} from "@/app/admin/actions";

import { fieldClass } from "./ui";

export type RubricRow = {
  slug: string;
  name: string;
  parent: string | null;
  locked: boolean;
  countLabel: string;
};

const actionClass = "text-sm text-olive disabled:text-muted-foreground";
const quietClass = "text-sm text-muted-foreground disabled:text-muted-foreground";

type Editing = { slug: string; name: string; base: string };
type Discard = { run: () => void };

export function RubricBoard({ rows }: { rows: RubricRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [discard, setDiscard] = useState<Discard | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ slug: string; message: string } | null>(null);
  const [fieldError, setFieldError] = useState<{ key: string; message: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [parentDraft, setParentDraft] = useState("");
  const [childDraft, setChildDraft] = useState<Record<string, string>>({});
  const orderKey = rows.map((row) => `${row.slug}:${row.name}`).join("|");

  useEffect(() => {
    if (!anchor) return;
    const node = document.getElementById(`rubric-${anchor}`);
    if (!node) return;
    node.scrollIntoView({ block: "nearest" });
    if (editing?.slug === anchor) return;
    node.focus({ preventScroll: true });
  }, [anchor, orderKey, editing?.slug]);

  function guard(run: () => void) {
    if (editing && editing.name !== editing.base) {
      setDiscard({ run });
      setAnchor(editing.slug);
      return;
    }
    setDiscard(null);
    run();
  }

  function acceptDiscard() {
    const run = discard?.run;
    setDiscard(null);
    setEditing(null);
    setFieldError(null);
    run?.();
  }

  function mutate(task: () => Promise<RubricActionResult>, done: (result: RubricActionResult) => void) {
    startTransition(async () => {
      done(await task());
    });
  }

  function finishSaved(slug: string) {
    setEditing(null);
    setDiscard(null);
    setDeleteSlug(null);
    setRowError(null);
    setFieldError(null);
    setNotice(slug);
    setAnchor(slug);
    router.refresh();
  }

  function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const name = editing.name.trim();
    if (!name) {
      setFieldError({ key: editing.slug, message: "Введите название." });
      return;
    }
    const slug = editing.slug;
    mutate(
      () => renameRubricAction(slug, name),
      (result) => {
        if (!result.ok) {
          setFieldError({ key: slug, message: result.error });
          setAnchor(slug);
          return;
        }
        finishSaved(slug);
      },
    );
  }

  function addRubric(name: string, parent: string | null, key: string, clear: () => void) {
    const trimmed = name.trim();
    if (!trimmed) {
      setFieldError({ key, message: "Введите название." });
      return;
    }
    mutate(
      () => createRubricAction(trimmed, parent),
      (result) => {
        if (!result.ok) {
          setFieldError({ key, message: result.error });
          return;
        }
        clear();
        finishSaved(result.slug);
      },
    );
  }

  function remove(slug: string) {
    const row = rows.find((item) => item.slug === slug);
    const siblings = rows.filter((item) => item.parent === (row?.parent ?? null));
    const index = siblings.findIndex((item) => item.slug === slug);
    const stay = siblings[index - 1]?.slug ?? siblings[index + 1]?.slug ?? row?.parent ?? null;
    mutate(
      () => deleteRubricAction(slug),
      (result) => {
        if (!result.ok) {
          setDeleteSlug(null);
          setRowError({ slug, message: result.error });
          setAnchor(slug);
          return;
        }
        setDeleteSlug(null);
        setRowError(null);
        setNotice(null);
        setAnchor(stay);
        router.refresh();
      },
    );
  }

  function move(slug: string, direction: "up" | "down") {
    setDeleteSlug(null);
    setRowError(null);
    mutate(
      () => moveRubricAction(slug, direction),
      (result) => {
        if (!result.ok) {
          setRowError({ slug, message: result.error });
          setAnchor(slug);
          return;
        }
        setNotice(null);
        setRowError(null);
        setAnchor(slug);
        router.refresh();
      },
    );
  }

  const sections = rows.filter((row) => !row.parent);

  return (
    <div>
      <h1 className="font-heading text-4xl tracking-tight">Рубрики</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Порядок разделов здесь — порядок главного меню. Подрубрики открываются списком у своего раздела.
      </p>
      <form
        className="mt-8 flex flex-wrap items-center gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          guard(() => addRubric(parentDraft, null, "parent", () => setParentDraft("")));
        }}
      >
        <input
          name="name"
          value={parentDraft}
          placeholder="Новая рубрика"
          aria-label="Новая рубрика"
          onChange={(event) => {
            setParentDraft(event.target.value);
            if (fieldError?.key === "parent") setFieldError(null);
          }}
          className={`${fieldClass} max-w-sm`}
        />
        <button type="submit" disabled={pending} className="rounded-full bg-olive px-4 py-2 text-sm text-accent-foreground disabled:opacity-60">
          Добавить рубрику
        </button>
        {fieldError?.key === "parent" ? <p className="w-full text-sm text-olive-deep">{fieldError.message}</p> : null}
      </form>
      <ul className="mt-8 divide-y divide-border border-y border-border" aria-busy={pending}>
        {sections.map((section, index) => {
          const children = rows.filter((row) => row.parent === section.slug);
          return (
            <li key={section.slug} className="py-6">
              <RubricLine
                row={section}
                index={index}
                total={sections.length}
                pending={pending}
                editing={editing}
                notice={notice}
                fieldError={fieldError?.key === section.slug ? fieldError.message : null}
                onDraft={(name) => {
                  setEditing((current) => (current ? { ...current, name } : current));
                  setDiscard(null);
                  if (fieldError?.key === section.slug) setFieldError(null);
                }}
                onSave={saveEdit}
                onCancel={() => {
                  setEditing(null);
                  setDiscard(null);
                  setFieldError(null);
                }}
                onEdit={() =>
                  guard(() => {
                    setDeleteSlug(null);
                    setRowError(null);
                    setFieldError(null);
                    setEditing({ slug: section.slug, name: section.name, base: section.name });
                    setAnchor(section.slug);
                  })
                }
                confirming={deleteSlug === section.slug}
                onDelete={() =>
                  guard(() => {
                    setRowError(null);
                    setDeleteSlug(section.slug);
                    setAnchor(section.slug);
                  })
                }
                onMove={(direction) => guard(() => move(section.slug, direction))}
              />
              {discard && editing?.slug === section.slug ? (
                <DiscardQuestion pending={pending} onAccept={acceptDiscard} onStay={() => setDiscard(null)} />
              ) : null}
              {deleteSlug === section.slug ? (
                <DeleteQuestion name={section.name} pending={pending} onDelete={() => remove(section.slug)} onCancel={() => setDeleteSlug(null)} />
              ) : null}
              {rowError?.slug === section.slug ? <p className="mt-2 text-sm text-olive-deep">{rowError.message}</p> : null}
              <form
                className="mt-4 flex flex-wrap items-center gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const name = childDraft[section.slug] ?? "";
                  guard(() =>
                    addRubric(name, section.slug, `child:${section.slug}`, () =>
                      setChildDraft((current) => ({ ...current, [section.slug]: "" })),
                    ),
                  );
                }}
              >
                <input
                  name="name"
                  value={childDraft[section.slug] ?? ""}
                  placeholder="Новая подрубрика"
                  aria-label={`Новая подрубрика: ${section.name}`}
                  onChange={(event) => {
                    const value = event.target.value;
                    setChildDraft((current) => ({ ...current, [section.slug]: value }));
                    if (fieldError?.key === `child:${section.slug}`) setFieldError(null);
                  }}
                  className={`${fieldClass} max-w-xs`}
                />
                <button type="submit" disabled={pending} className={actionClass}>
                  Добавить подрубрику
                </button>
                {fieldError?.key === `child:${section.slug}` ? (
                  <p className="w-full text-sm text-olive-deep">{fieldError.message}</p>
                ) : null}
              </form>
              {children.length ? (
                <ul className="mt-4 grid gap-4 border-l border-border pl-4">
                  {children.map((child, childIndex) => (
                    <li key={child.slug}>
                      <RubricLine
                        row={child}
                        index={childIndex}
                        total={children.length}
                        pending={pending}
                        editing={editing}
                        notice={notice}
                        fieldError={fieldError?.key === child.slug ? fieldError.message : null}
                        onDraft={(name) => {
                          setEditing((current) => (current ? { ...current, name } : current));
                          setDiscard(null);
                          if (fieldError?.key === child.slug) setFieldError(null);
                        }}
                        onSave={saveEdit}
                        onCancel={() => {
                          setEditing(null);
                          setDiscard(null);
                          setFieldError(null);
                        }}
                        onEdit={() =>
                          guard(() => {
                            setDeleteSlug(null);
                            setRowError(null);
                            setFieldError(null);
                            setEditing({ slug: child.slug, name: child.name, base: child.name });
                            setAnchor(child.slug);
                          })
                        }
                        confirming={deleteSlug === child.slug}
                        onDelete={() =>
                          guard(() => {
                            setRowError(null);
                            setDeleteSlug(child.slug);
                            setAnchor(child.slug);
                          })
                        }
                        onMove={(direction) => guard(() => move(child.slug, direction))}
                      />
                      {discard && editing?.slug === child.slug ? (
                        <DiscardQuestion pending={pending} onAccept={acceptDiscard} onStay={() => setDiscard(null)} />
                      ) : null}
                      {deleteSlug === child.slug ? (
                        <DeleteQuestion
                          name={child.name}
                          pending={pending}
                          onDelete={() => remove(child.slug)}
                          onCancel={() => setDeleteSlug(null)}
                        />
                      ) : null}
                      {rowError?.slug === child.slug ? <p className="mt-2 text-sm text-olive-deep">{rowError.message}</p> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RubricLine({
  row,
  index,
  total,
  pending,
  editing,
  notice,
  fieldError,
  confirming,
  onDraft,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  onMove,
}: {
  row: RubricRow;
  index: number;
  total: number;
  pending: boolean;
  editing: Editing | null;
  notice: string | null;
  fieldError: string | null;
  confirming: boolean;
  onDraft: (name: string) => void;
  onSave: (event: FormEvent) => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
}) {
  const open = editing?.slug === row.slug;
  return (
    <div id={`rubric-${row.slug}`} tabIndex={-1} className="scroll-mt-8 outline-none">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <button type="button" disabled={pending || index === 0} aria-label={`Выше: ${row.name}`} className={actionClass} onClick={() => onMove("up")}>
            Выше
          </button>
          <button
            type="button"
            disabled={pending || index === total - 1}
            aria-label={`Ниже: ${row.name}`}
            className={actionClass}
            onClick={() => onMove("down")}
          >
            Ниже
          </button>
        </div>
        {open && editing ? (
          <form onSubmit={onSave} className="flex flex-wrap items-center gap-3">
            <input
              key={row.slug}
              value={editing.name}
              aria-label={`Название: ${row.name}`}
              autoFocus
              onChange={(event) => onDraft(event.target.value)}
              className={`${fieldClass} max-w-sm`}
            />
            <button type="submit" disabled={pending} className={actionClass}>
              Сохранить
            </button>
            <button type="button" disabled={pending} className={quietClass} onClick={onCancel}>
              Отмена
            </button>
          </form>
        ) : (
          <>
            <span className={row.parent ? "text-sm text-foreground" : "font-heading text-xl tracking-tight"}>{row.name}</span>
            {row.parent ? null : <span className="text-xs text-muted-foreground">Пункт меню</span>}
            {row.locked ? <span className="text-xs text-muted-foreground">Удалить нельзя</span> : null}
            <span className="text-sm text-muted-foreground">{row.countLabel}</span>
            {notice === row.slug ? <span className="text-sm text-olive">Сохранено</span> : null}
            <button type="button" disabled={pending} className={actionClass} onClick={onEdit}>
              Изменить
            </button>
            {row.locked || confirming ? null : (
              <button type="button" disabled={pending} className={quietClass} onClick={onDelete}>
                Удалить
              </button>
            )}
          </>
        )}
      </div>
      {open && fieldError ? <p className="mt-2 text-sm text-olive-deep">{fieldError}</p> : null}
    </div>
  );
}

function DiscardQuestion({ pending, onAccept, onStay }: { pending: boolean; onAccept: () => void; onStay: () => void }) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-3 text-sm">
      <span>Не сохранять изменение?</span>
      <button type="button" disabled={pending} className={actionClass} onClick={onAccept}>
        Не сохранять
      </button>
      <button type="button" disabled={pending} className={quietClass} onClick={onStay}>
        Остаться
      </button>
    </p>
  );
}

function DeleteQuestion({
  name,
  pending,
  onDelete,
  onCancel,
}: {
  name: string;
  pending: boolean;
  onDelete: () => void;
  onCancel: () => void;
}) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-3 text-sm">
      <span>Удалить «{name}»?</span>
      <button type="button" disabled={pending} className={actionClass} onClick={onDelete}>
        Удалить
      </button>
      <button type="button" disabled={pending} className={quietClass} onClick={onCancel}>
        Отмена
      </button>
    </p>
  );
}
