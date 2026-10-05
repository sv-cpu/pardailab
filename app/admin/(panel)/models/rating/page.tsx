import Link from "next/link";

import { addRatingModelAction, dropRatingModelAction } from "@/app/admin/actions";
import { RatingBoard } from "@/components/admin/rating-board";
import { Notice, fieldClass } from "@/components/admin/ui";
import { rateModels, sortModels } from "@/lib/content/models";
import { listModels } from "@/lib/db";
import { ratingStamp } from "@/lib/rating";
import { requireEditor } from "@/lib/users";
import type { ModelProfile, ModelScores } from "@/lib/types";

export default async function RatingPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireEditor();
  const query = await searchParams;
  const stamp = ratingStamp();
  const models: ModelProfile[] = sortModels(rateModels(listModels())).map((model) => {
    const scores = {} as ModelScores;
    for (const key of ["speed", "cost", "quality", "russian", "code", "agents", "documents", "context"] as const) {
      scores[key] = model.scores[key];
    }
    return { ...model, scores };
  });
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <p className="text-sm">
        <Link href="/modeli" className="text-olive">
          Открыть на сайте
        </Link>
      </p>
      <Notice saved={query.saved} error={query.error} />
      <RatingBoard models={models.filter((model) => model.inRating !== false)} updated={stamp.updated} nextUpdate={stamp.nextUpdate} />
      <section className="grid gap-4 border border-border p-4">
        <h2 className="font-heading text-2xl">Список моделей</h2>
        <p className="text-sm text-muted-foreground">В рейтинге всегда десять моделей. Новая строка получает оценки 5, пока лаборатория не пройдёт испытания.</p>
        <form action={addRatingModelAction} className="grid gap-3">
          <input name="versionName" required placeholder="Полное название с версией" className={fieldClass} />
          <input name="vendor" required placeholder="Вендор" className={fieldClass} />
          <input name="slug" required placeholder="Адрес латиницей" className={fieldClass} />
          <button type="submit" className="justify-self-start text-sm text-olive">
            Добавить в рейтинг
          </button>
        </form>
        <ul className="grid gap-2">
          {models
            .filter((model) => model.inRating !== false)
            .map((model) => (
              <li key={model.slug}>
                <form action={dropRatingModelAction} className="flex items-center justify-between gap-3">
                  <input type="hidden" name="slug" value={model.slug} />
                  <span className="text-sm">{model.versionName || model.name}</span>
                  <button type="submit" className="text-sm text-muted-foreground">
                    Убрать
                  </button>
                </form>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
