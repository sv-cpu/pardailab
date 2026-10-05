import Link from "next/link";

import { RatingBoard } from "@/components/admin/rating-board";
import { Notice } from "@/components/admin/ui";
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
      <div>
        <h1 className="font-heading text-4xl tracking-tight">Рейтинг моделей</h1>
        <p className="mt-3 text-muted-foreground">
          Шкала обновляется целиком, обычно раз в одну-две недели. Итог считается из оценок, порядок на сайте изменится после сохранения.
        </p>
        <p className="mt-2 text-sm">
          <Link href="/modeli" className="text-olive">
            Открыть на сайте
          </Link>
        </p>
      </div>
      <Notice saved={query.saved} error={query.error} />
      <RatingBoard models={models} updated={stamp.updated} note={stamp.note} />
    </div>
  );
}
