"use client";

import { useMemo, useState } from "react";

import { saveRatingAction } from "@/app/admin/actions";
import { fieldClass } from "@/components/admin/ui";
import { ratingPeriod } from "@/lib/rating-view";
import { costHint, overallScore, overallWeights, ratingColumns, ratingLeaders } from "@/lib/scores";
import type { ModelProfile, ModelScores } from "@/lib/types";

const weightRows = [
  ["Качество", overallWeights.quality],
  ["Документы", overallWeights.documents],
  ["Русский язык", overallWeights.russian],
  ["Код", overallWeights.code],
  ["AI-агенты", overallWeights.agents],
  ["Длинный контекст", overallWeights.context],
  ["Скорость", overallWeights.speed],
  ["Стоимость", overallWeights.cost],
] as const;

export function RatingBoard({
  models,
  updated,
  nextUpdate,
}: {
  models: ModelProfile[];
  updated: string;
  nextUpdate: string;
}) {
  const [tested, setTested] = useState(updated);
  const [rows, setRows] = useState(() =>
    models.map((model) => ({
      slug: model.slug,
      vendor: model.vendor,
      versionName: model.versionName?.trim() || model.name,
      scores: { ...model.scores },
    })),
  );

  const ranked = useMemo(
    () => [...rows].sort((a, b) => overallScore(b.scores) - overallScore(a.scores) || a.versionName.localeCompare(b.versionName, "ru")),
    [rows],
  );

  function setScore(slug: string, key: keyof ModelScores, raw: string) {
    const value = Number(raw.replace(",", "."));
    setRows((current) =>
      current.map((row) =>
        row.slug === slug ? { ...row, scores: { ...row.scores, [key]: Number.isFinite(value) ? value : 0 } } : row,
      ),
    );
  }

  function setVersion(slug: string, versionName: string) {
    setRows((current) => current.map((row) => (row.slug === slug ? { ...row, versionName } : row)));
  }

  const leaders = ratingLeaders.map(([key, label]) => {
    const leader = [...ranked].sort(
      (a, b) => b.scores[key] - a.scores[key] || overallScore(b.scores) - overallScore(a.scores),
    )[0];
    return { key, label, name: leader?.versionName ?? "—" };
  });

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-heading text-4xl tracking-tight">Рейтинг AI-моделей</h1>
        <p className="mt-4 font-heading text-2xl text-olive">{ratingPeriod(tested)}</p>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          Редакционная шкала лаборатории. Итог — взвешенная сумма восьми критериев, а не среднее. По стоимости оценка 10
          означает наиболее экономичную модель при сопоставимом качестве.
        </p>
      </div>

      <form action={saveRatingAction} className="grid gap-8">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Дата последнего тестирования</span>
            <input name="updated" type="date" required value={tested} onChange={(event) => setTested(event.target.value)} className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Следующее обновление</span>
            <input name="nextUpdate" type="date" required defaultValue={nextUpdate} className={fieldClass} />
          </label>
        </div>

        <section className="grid gap-4">
          <h2 className="font-heading text-3xl tracking-tight">Топ-10 моделей</h2>
          <p className="text-sm text-muted-foreground">
            Сейчас в рейтинге {ranked.length} из 10. Место и итог пересчитываются сразу. На сайте публикуются десять моделей с лучшим итогом.
          </p>
          <ol className="grid gap-4">
            {ranked.map((row, index) => (
              <li key={row.slug} className="min-w-0 border border-border p-4">
                <input type="hidden" name="modelSlug" value={row.slug} />
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-mono text-sm text-olive">{index + 1}</p>
                  <p className="font-mono text-sm text-olive">
                    {overallScore(row.scores).toLocaleString("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </p>
                </div>
                <label className="mt-3 grid gap-1 text-xs text-muted-foreground">
                  Полное название с версией
                  <input
                    name={`${row.slug}:version`}
                    value={row.versionName}
                    onChange={(event) => setVersion(row.slug, event.target.value)}
                    required
                    className={fieldClass}
                  />
                </label>
                <p className="mt-1 text-xs text-muted-foreground">{row.vendor}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {ratingColumns.map(([key, label]) => (
                    <label key={key} className="grid min-w-0 gap-1 text-xs text-muted-foreground">
                      {label}
                      <input
                        name={`${row.slug}:${key}`}
                        type="number"
                        min={0}
                        max={10}
                        step="0.1"
                        value={row.scores[key]}
                        onChange={(event) => setScore(row.slug, key, event.target.value)}
                        className={fieldClass}
                      />
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <button type="submit" className="justify-self-start rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep">
            Сохранить шкалу
          </button>
        </section>
      </form>

      <section>
        <h2 className="font-heading text-3xl tracking-tight">Лидеры по категориям</h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {leaders.map((item) => (
            <li key={item.key} className="flex flex-wrap items-baseline justify-between gap-3 py-3">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-heading text-xl">{item.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-3xl tracking-tight">Как считается итоговая оценка</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">Итоговая оценка является взвешенной суммой. {costHint}.</p>
      </section>

      <section>
        <h2 className="font-heading text-3xl tracking-tight">Вес критериев</h2>
        <table className="mt-4 w-full max-w-xl border-collapse text-sm">
          <tbody>
            {weightRows.map(([label, weight]) => (
              <tr key={label} className="border-b border-border">
                <td className="py-2">{label}</td>
                <td className="py-2 text-right font-mono">{Math.round(weight * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="max-w-3xl space-y-3 leading-relaxed text-muted-foreground">
        <h2 className="font-heading text-3xl tracking-tight text-foreground">Методика PardAiLab</h2>
        <p>Каждая модель тестируется по единому набору сценариев.</p>
        <p>Используются одинаковые инструкции, одинаковые условия запуска и единые критерии оценки.</p>
        <p>Результаты проверяются лабораторией PardAiLab и публикуются только после завершения полного цикла испытаний.</p>
      </section>
    </div>
  );
}
