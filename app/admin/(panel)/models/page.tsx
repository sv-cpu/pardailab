import { RecordList } from "@/components/admin/ui";
import { listModels } from "@/lib/db";
import { overallScore } from "@/lib/scores";
import { requireEditor } from "@/lib/users";

export default async function ModelsPage() {
  await requireEditor();
  const rows = listModels()
    .sort((a, b) => overallScore(b.scores) - overallScore(a.scores) || a.name.localeCompare(b.name, "ru"))
    .map((model) => ({ slug: model.slug, title: model.name, meta: model.vendor }));
  return <RecordList title="Модели" href="/admin/models/new" rows={rows} />;
}
