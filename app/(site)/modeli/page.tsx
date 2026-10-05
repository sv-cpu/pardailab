import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { PageIntro } from "@/components/page-intro";
import { getModels } from "@/lib/cms";
import { sortModels } from "@/lib/content/models";
import { formatScore } from "@/lib/format";
import { modelTitle } from "@/lib/rating-view";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Модели",
  description: "Карточки моделей лаборатории PardAiLabs: профиль, сильные стороны и когда модель лучше не брать.",
  path: "/modeli",
});

export default async function Page() {
  const models = sortModels(await getModels());
  return (
    <Container className="py-16 sm:py-20">
      <PageIntro
        eyebrow="Модели"
        title="Карточки лаборатории"
        lede="Здесь профили моделей. Сводные выпуски шкалы публикуются отдельно и не затирают друг друга."
      />
      <p className="mt-6 text-sm">
        <Link href="/benchmarki" className="text-olive">
          Бенчмарки
        </Link>
      </p>
      <ul className="mt-10 divide-y divide-border border-y border-border">
        {models.map((model) => (
          <li key={model.slug} className="py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-heading text-3xl">
                <Link href={`/modeli/${model.slug}`} className="hover:text-olive">
                  {modelTitle(model)}
                </Link>
              </h2>
              <span className="font-mono text-olive">{formatScore(model.scores.overall)}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{model.vendor}</p>
            <p className="mt-3 max-w-3xl leading-relaxed">{model.summary}</p>
          </li>
        ))}
      </ul>
    </Container>
  );
}
