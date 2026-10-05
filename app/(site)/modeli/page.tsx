import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { PageIntro } from "@/components/page-intro";
import { getModels } from "@/lib/cms";
import { sortModels } from "@/lib/content/models";
import { formatDate, formatScore } from "@/lib/format";
import { ratingStamp } from "@/lib/rating";
import { costHint, scoreFields } from "@/lib/scores";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Рейтинг моделей",
  description:
    "Редакционная шкала PardAiLabs: GPT, Claude, Gemini, Qwen, DeepSeek, Mistral и Llama по скорости, цене, качеству, русскому, коду, агентам, документам и контексту.",
  path: "/modeli",
});

export default async function Page() {
  const models = sortModels(await getModels());
  const stamp = ratingStamp();
  return (
    <Container className="py-16 sm:py-20">
      <PageIntro
        eyebrow="Рейтинг моделей"
        title="Семь моделей на одной шкале"
        lede="Оценки от 0 до 10 выставляет лаборатория. Итог — взвешенная сумма, а не среднее. По стоимости 10 означает более бережную цену, а не более высокую."
      />
      <details className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        <summary className="cursor-pointer text-foreground">Как считается итог</summary>
        <p className="mt-3">
          Качество 22%, документы 14%, русский язык 14%, код 12%, агенты 12%, длинный контекст 12%, скорость 7%,
          стоимость 7%. {costHint}. Шкала описывает профиль линейки на {formatDate(stamp.updated)} и обновляется, когда
          лаборатория проходит сценарии заново.
          {stamp.note ? ` ${stamp.note}` : ""}
        </p>
      </details>
      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <caption className="sr-only">Сравнение моделей по шкале PardAiLabs</caption>
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-3 pr-4 font-medium">Модель</th>
              {scoreFields.map(([key, label]) => (
                <th key={key} className="px-2 py-3 font-medium">
                  {label}
                </th>
              ))}
              <th className="py-3 pl-2 font-medium">Итог</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.slug} className="border-b border-border">
                <th className="py-4 pr-4 font-heading text-xl font-normal">
                  <Link href={`/modeli/${model.slug}`} className="hover:text-olive">
                    {model.name}
                  </Link>
                </th>
                {scoreFields.map(([key]) => (
                  <td key={key} className="px-2 py-4 font-mono text-xs">
                    {formatScore(model.scores[key])}
                  </td>
                ))}
                <td className="py-4 pl-2 font-mono text-sm text-olive">{formatScore(model.scores.overall)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {models.map((model) => (
          <article key={model.slug} className="rounded-2xl border border-border p-6">
            <h2 className="font-heading text-3xl">
              <Link href={`/modeli/${model.slug}`} className="hover:text-olive">
                {model.name}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{model.vendor}</p>
            <p className="mt-4 leading-relaxed">{model.summary}</p>
          </article>
        ))}
      </div>
    </Container>
  );
}
