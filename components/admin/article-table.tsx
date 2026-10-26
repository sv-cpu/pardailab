"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { articleListLabel, filterArticleRows, type ArticleTableRow } from "@/lib/article-table";
import { kindLabel } from "@/lib/paths";
import type { ArticleKind } from "@/lib/types";

import { fieldClass } from "./ui";

export type ArticleRubricOption = {
  slug: string;
  name: string;
  parent: string | null;
};

const kindOrder: ArticleKind[] = ["news", "practice", "development", "research"];
const emptyQuery = { text: "", kind: "", rubric: "", author: "" };

export function ArticleTable({ rows, rubrics }: { rows: ArticleTableRow[]; rubrics: ArticleRubricOption[] }) {
  const [text, setText] = useState("");
  const [kind, setKind] = useState("");
  const [rubric, setRubric] = useState("");
  const [author, setAuthor] = useState("");
  const filtered = useMemo(
    () => filterArticleRows(rows, { text, kind, rubric, author }),
    [rows, text, kind, rubric, author],
  );
  const narrowed = text.trim() !== "" || kind !== "" || rubric !== "" || author !== "";
  const authors = useMemo(
    () => [...new Set(rows.map((row) => row.author))].sort((a, b) => a.localeCompare(b, "ru")),
    [rows],
  );
  const kinds = kindOrder.filter((item) => rows.some((row) => row.kind === item));
  const parents = rubrics.filter((item) => !item.parent);
  const grouped = new Set(parents.map((item) => item.slug));
  for (const item of rubrics) {
    if (item.parent && grouped.has(item.parent)) grouped.add(item.slug);
  }
  const loose = rubrics.filter((item) => !grouped.has(item.slug));

  function reset() {
    setText(emptyQuery.text);
    setKind(emptyQuery.kind);
    setRubric(emptyQuery.rubric);
    setAuthor(emptyQuery.author);
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-heading text-4xl tracking-tight">Статьи</h1>
        <Link href="/admin/articles/new" className="rounded-full bg-olive px-4 py-2 text-sm text-accent-foreground hover:bg-olive-deep">
          Новая статья
        </Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <input
          value={text}
          placeholder="Название"
          aria-label="Поиск по названию"
          onChange={(event) => setText(event.target.value)}
          className={fieldClass}
        />
        <select aria-label="Раздел" value={kind} onChange={(event) => setKind(event.target.value)} className={fieldClass}>
          <option value="">Все разделы</option>
          {kinds.map((item) => (
            <option key={item} value={item}>
              {kindLabel[item]}
            </option>
          ))}
        </select>
        <select aria-label="Рубрика" value={rubric} onChange={(event) => setRubric(event.target.value)} className={fieldClass}>
          <option value="">Все рубрики</option>
          {parents.map((parent) => (
            <optgroup key={parent.slug} label={parent.name}>
              <option value={parent.slug}>{parent.name}</option>
              {rubrics
                .filter((item) => item.parent === parent.slug)
                .map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
            </optgroup>
          ))}
          {loose.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        {authors.length > 1 ? (
          <select aria-label="Автор" value={author} onChange={(event) => setAuthor(event.target.value)} className={fieldClass}>
            <option value="">Все авторы</option>
            {authors.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      <div className="mt-3 flex items-center gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {articleListLabel(filtered.length, rows.length, narrowed)}
        </p>
        {narrowed ? (
          <button type="button" onClick={reset} className="text-sm text-olive">
            Сбросить
          </button>
        ) : null}
      </div>
      {filtered.length ? (
        <div className="mt-4 overflow-x-auto border-y border-border">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground">
                <th className="py-3 pr-4 font-normal">Название</th>
                <th className="py-3 pr-4 font-normal">Раздел</th>
                <th className="py-3 pr-4 font-normal">Рубрика</th>
                <th className="py-3 pr-4 font-normal">Автор</th>
                <th className="py-3 font-normal">Дата</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.slug} className="border-t border-border">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/articles/${row.slug}`} className="text-foreground hover:text-olive">
                      {row.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">{row.section}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.rubric}</td>
                  <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">{row.author}</td>
                  <td className="py-3 whitespace-nowrap text-muted-foreground">{row.dateLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
