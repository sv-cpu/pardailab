import { RubricBoard } from "@/components/admin/rubric-board";
import { articleCountLabel, listRubrics, rubricArticleCounts } from "@/lib/rubrics";
import { requireEditor } from "@/lib/users";

export default async function RubricsPage() {
  await requireEditor();
  const counts = rubricArticleCounts();
  const rows = listRubrics().map((rubric) => ({
    slug: rubric.slug,
    name: rubric.name,
    parent: rubric.parent,
    locked: rubric.kind !== null,
    countLabel: articleCountLabel(counts.get(rubric.slug) ?? 0),
  }));
  return <RubricBoard rows={rows} />;
}
