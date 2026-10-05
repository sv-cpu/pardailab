"use client";

import { useMemo, useState } from "react";

import { saveBenchmarkAction } from "@/app/admin/actions";
import { fieldClass } from "@/components/admin/ui";
import type { Benchmark, BenchmarkRow } from "@/lib/benchmarks";
import { overallScore, ratingColumns } from "@/lib/scores";
import type { ModelProfile, ModelScores } from "@/lib/types";

export function BenchmarkEditor({
  issue,
  catalog,
  originalSlug = "",
}: {
  issue: Benchmark;
  catalog: ModelProfile[];
  originalSlug?: string;
}) {
  const [rows, setRows] = useState<BenchmarkRow[]>(issue.rows);
  const ranked = useMemo(
    () =>
      rows
        .map((row, index) => ({ ...row, index }))
        .sort((a, b) => overallScore(b.scores) - overallScore(a.scores) || a.versionName.localeCompare(b.versionName, "ru")),
    [rows],
  );

  function patch(index: number, next: Partial<BenchmarkRow>) {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...next } : row)));
  }

  function pickModel(index: number, slug: string) {
    const model = catalog.find((item) => item.slug === slug);
    if (!model) {
      patch(index, { modelSlug: "" });
      return;
    }
    patch(index, {
      modelSlug: model.slug,
      versionName: model.versionName?.trim() || model.name,
      vendor: model.vendor,
      scores: { ...model.scores },
    });
  }

  return (
    <form action={saveBenchmarkAction} className="mx-auto grid w-full max-w-3xl gap-5">
      <input type="hidden" name="originalSlug" value={originalSlug} />
      <label className="grid gap-2 text-sm">
        <span className="text-muted-foreground">Адрес выпуска</span>
        <input name="slug" required defaultValue={issue.slug} placeholder="2026-10" className={fieldClass} />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="text-muted-foreground">Дата тестирования</span>
        <input name="tested" type="date" required defaultValue={issue.tested} className={fieldClass} />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="text-muted-foreground">Следующее обновление</span>
        <input name="nextUpdate" type="date" required defaultValue={issue.nextUpdate} className={fieldClass} />
      </label>
      <ol className="grid gap-4">
        {ranked.map((row) => (
          <li key={row.index} className="min-w-0 border border-border p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-sm text-olive">{ranked.findIndex((item) => item.index === row.index) + 1}</p>
              <p className="font-mono text-sm text-olive">
                {overallScore(row.scores).toLocaleString("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </p>
            </div>
            <label className="mt-3 grid gap-1 text-xs text-muted-foreground">
              Взять оценки модели
              <select value={row.modelSlug} onChange={(event) => pickModel(row.index, event.target.value)} className={fieldClass}>
                <option value="">Своя строка</option>
                {catalog.map((model) => (
                  <option key={model.slug} value={model.slug}>
                    {model.name}
                  </option>
                ))}
              </select>
            </label>
            <input type="hidden" name={`row-${row.index}-model`} value={row.modelSlug} />
            <label className="mt-3 grid gap-1 text-xs text-muted-foreground">
              Полное название с версией
              <input
                name={`row-${row.index}-version`}
                value={row.versionName}
                onChange={(event) => patch(row.index, { versionName: event.target.value })}
                required
                className={fieldClass}
              />
            </label>
            <label className="mt-3 grid gap-1 text-xs text-muted-foreground">
              Вендор
              <input
                name={`row-${row.index}-vendor`}
                value={row.vendor}
                onChange={(event) => patch(row.index, { vendor: event.target.value })}
                className={fieldClass}
              />
            </label>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ratingColumns.map(([key, label]) => (
                <label key={key} className="grid min-w-0 gap-1 text-xs text-muted-foreground">
                  {label}
                  <input
                    name={`row-${row.index}-${key}`}
                    type="number"
                    min={0}
                    max={10}
                    step="0.1"
                    value={row.scores[key]}
                    onChange={(event) =>
                      patch(row.index, {
                        scores: { ...row.scores, [key]: Number(event.target.value.replace(",", ".")) || 0 },
                      })
                    }
                    className={fieldClass}
                  />
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <button type="submit" className="justify-self-start rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep">
        Сохранить выпуск
      </button>
    </form>
  );
}
