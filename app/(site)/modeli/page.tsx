import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { getModels } from "@/lib/cms";
import { formatDate, formatScore } from "@/lib/format";
import { ratingStamp } from "@/lib/rating";
import { categoryLeaders, modelTitle, ratingPeriod, topTen } from "@/lib/rating-view";
import { costHint, overallWeights, ratingColumns } from "@/lib/scores";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Рейтинг AI-моделей",
  description:
    "Топ-10 AI-моделей по шкале PardAiLabs: качество, документы, русский язык, код, агенты, контекст, скорость и стоимость.",
  path: "/modeli",
});

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

export default async function Page() {
  const models = topTen(await getModels());
  const stamp = ratingStamp();
  const leaders = categoryLeaders(models);
  return (
    <Container className="py-16 sm:py-20">
      <h1 className="font-heading text-4xl tracking-tight sm:text-5xl">Рейтинг AI-моделей</h1>
      <p className="mt-4 font-heading text-2xl text-olive">{ratingPeriod(stamp.updated)}</p>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
        Редакционная шкала лаборатории. Итог — взвешенная сумма восьми критериев, а не среднее. По стоимости оценка 10
        означает наиболее экономичную модель при сопоставимом качестве.
      </p>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Последнее тестирование: {formatDate(stamp.updated)}.
        {stamp.nextUpdate ? ` Следующее обновление: ${formatDate(stamp.nextUpdate)}.` : " Следующее обновление — через одну-две недели."}
      </p>

      <h2 className="mt-12 font-heading text-3xl tracking-tight">Топ-10 моделей</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[64rem] border-collapse text-left text-sm">
          <caption className="sr-only">Топ-10 моделей по шкале PardAiLabs</caption>
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-3 pr-3 font-medium">Место</th>
              <th className="py-3 pr-4 font-medium">Модель</th>
              <th className="px-2 py-3 font-medium">Итог</th>
              {ratingColumns.map(([key, label]) => (
                <th key={key} className="px-2 py-3 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map((model, index) => (
              <tr key={model.slug} className="border-b border-border">
                <td className="py-4 pr-3 font-mono text-olive">{index + 1}</td>
                <th className="py-4 pr-4 font-heading text-xl font-normal">
                  <Link href={`/modeli/${model.slug}`} className="hover:text-olive">
                    {modelTitle(model)}
                  </Link>
                </th>
                <td className="px-2 py-4 font-mono text-sm text-olive">{formatScore(model.scores.overall)}</td>
                {ratingColumns.map(([key]) => (
                  <td key={key} className="px-2 py-4 font-mono text-xs">
                    {formatScore(model.scores[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-14 font-heading text-3xl tracking-tight">Лидеры по категориям</h2>
      <ul className="mt-6 divide-y divide-border border-y border-border">
        {leaders.map((item) => (
          <li key={item.key} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
            <span className="text-muted-foreground">{item.label}</span>
            {item.model ? (
              <Link href={`/modeli/${item.model.slug}`} className="font-heading text-xl hover:text-olive">
                {modelTitle(item.model)}
              </Link>
            ) : (
              <span>—</span>
            )}
          </li>
        ))}
      </ul>

      <h2 className="mt-14 font-heading text-3xl tracking-tight">Как считается итоговая оценка</h2>
      <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
        Итоговая оценка является взвешенной суммой. {costHint}.
      </p>

      <h2 className="mt-14 font-heading text-3xl tracking-tight">Вес критериев</h2>
      <table className="mt-6 w-full max-w-xl border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="py-3 font-medium">Критерий</th>
            <th className="py-3 text-right font-medium">Вес</th>
          </tr>
        </thead>
        <tbody>
          {weightRows.map(([label, weight]) => (
            <tr key={label} className="border-b border-border">
              <td className="py-3">{label}</td>
              <td className="py-3 text-right font-mono">{Math.round(weight * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-14 font-heading text-3xl tracking-tight">Методика PardAiLabs</h2>
      <div className="mt-4 max-w-3xl space-y-3 leading-relaxed text-muted-foreground">
        <p>Каждая модель тестируется по единому набору сценариев.</p>
        <p>Используются одинаковые инструкции, одинаковые условия запуска и единые критерии оценки.</p>
        <p>Результаты проверяются лабораторией PardAiLabs и публикуются только после завершения полного цикла испытаний.</p>
      </div>
    </Container>
  );
}
