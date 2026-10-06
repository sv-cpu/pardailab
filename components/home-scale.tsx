import Link from "next/link";

import { formatScore } from "@/lib/format";
import { modelTitle, ratingPeriod, topTen } from "@/lib/rating-view";
import type { RatedModel } from "@/lib/types";
import { cn } from "@/lib/utils";

const columns = [
  ["overall", "Итог"],
  ["quality", "Качество"],
  ["russian", "Русский"],
  ["code", "Код"],
] as const;

const leads = [
  ["quality", "Качество"],
  ["russian", "Русский язык"],
  ["code", "Код"],
] as const;

type Column = (typeof columns)[number][0];

function scoreOf(model: RatedModel, key: Column) {
  return key === "overall" ? model.scores.overall : model.scores[key];
}

function leader(models: RatedModel[], key: Column) {
  return [...models].sort(
    (a, b) => scoreOf(b, key) - scoreOf(a, key) || b.scores.overall - a.scores.overall || a.name.localeCompare(b.name, "ru"),
  )[0];
}

export function HomeScale({ models, updated }: { models: RatedModel[]; updated: string }) {
  const rows = topTen(models);
  if (!rows.length) return null;
  const best = Object.fromEntries(columns.map(([key]) => [key, Math.max(...rows.map((model) => scoreOf(model, key)))])) as Record<
    Column,
    number
  >;

  return (
    <section className="border-t border-border">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">Шкала моделей</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {ratingPeriod(updated)}. Оливковым отмечен лучший результат в столбце.
          </p>
        </div>
        <span className="flex gap-4 text-sm">
          <Link href="/benchmarki" className="underline decoration-border underline-offset-4 hover:decoration-olive">
            Бенчмарки
          </Link>
          <Link href="/modeli" className="underline decoration-border underline-offset-4 hover:decoration-olive">
            Карточки
          </Link>
        </span>
      </div>
      <ul className="mt-6 flex flex-wrap gap-2">
        {leads.map(([key, label]) => {
          const model = leader(rows, key);
          if (!model) return null;
          return (
            <li key={key}>
              <Link
                href={`/modeli/${model.slug}`}
                className="inline-flex items-baseline gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:border-olive"
              >
                <span className="text-muted-foreground">{label}</span>
                <span>{modelTitle(model)}</span>
                <span className="font-mono text-olive">{formatScore(scoreOf(model, key))}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <caption className="sr-only">Сравнение моделей шкалы по итогу, качеству, русскому языку и коду</caption>
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th scope="col" className="py-3 pr-4 font-normal">
                Модель
              </th>
              {columns.map(([, label]) => (
                <th key={label} scope="col" className="px-3 py-3 text-right font-normal">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((model) => (
              <tr key={model.slug} className="border-b border-border">
                <th scope="row" className="py-3 pr-4 text-left font-heading text-lg font-normal">
                  <Link href={`/modeli/${model.slug}`} className="hover:text-olive">
                    {modelTitle(model)}
                  </Link>
                </th>
                {columns.map(([key]) => {
                  const score = scoreOf(model, key);
                  return (
                    <td key={key} className={cn("px-3 py-3 text-right font-mono", score === best[key] && "text-olive")}>
                      {formatScore(score)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
