"use client";

import { useState } from "react";

import { saveRatingAction } from "@/app/admin/actions";
import { fieldClass } from "@/components/admin/ui";
import { overallScore, scoreFields } from "@/lib/scores";
import type { ModelProfile, ModelScores } from "@/lib/types";

export function RatingBoard({
  models,
  updated,
  note,
}: {
  models: ModelProfile[];
  updated: string;
  note: string;
}) {
  const [scores, setScores] = useState<Record<string, ModelScores>>(() =>
    Object.fromEntries(models.map((model) => [model.slug, { ...model.scores }])),
  );

  function setScore(slug: string, key: keyof ModelScores, raw: string) {
    const value = Number(raw.replace(",", "."));
    setScores((current) => ({
      ...current,
      [slug]: { ...current[slug], [key]: Number.isFinite(value) ? value : 0 },
    }));
  }

  return (
    <form action={saveRatingAction} className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">Дата шкалы</span>
          <input name="updated" type="date" required defaultValue={updated} className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm sm:col-span-2">
          <span className="text-muted-foreground">Что изменилось</span>
          <textarea name="note" defaultValue={note} rows={3} className={fieldClass} placeholder="Коротко для страницы рейтинга" />
        </label>
      </div>
      <ol className="grid gap-4">
        {models.map((model) => {
          const current = scores[model.slug];
          return (
            <li key={model.slug} className="border border-border p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-heading text-2xl">{model.name}</h2>
                <p className="font-mono text-sm text-olive">{overallScore(current).toLocaleString("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{model.vendor}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {scoreFields.map(([key, label]) => (
                  <label key={key} className="grid gap-1 text-xs text-muted-foreground">
                    {label}
                    <input
                      name={`${model.slug}:${key}`}
                      type="number"
                      min={0}
                      max={10}
                      step="0.1"
                      value={current[key]}
                      onChange={(event) => setScore(model.slug, key, event.target.value)}
                      className={fieldClass}
                    />
                  </label>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
      <button type="submit" className="justify-self-start rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep">
        Сохранить шкалу
      </button>
    </form>
  );
}
