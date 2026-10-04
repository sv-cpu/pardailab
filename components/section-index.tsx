import { ArticleIndex } from "@/components/article-index";
import { listRubrics } from "@/lib/rubrics";
import type { ArticleKind } from "@/lib/types";

export async function SectionIndex({
  kind,
  eyebrow,
  title,
  lede,
  rubrika,
}: {
  kind: ArticleKind;
  eyebrow: string;
  title: string;
  lede: string;
  rubrika?: string;
}) {
  const rubrics = listRubrics();
  const parent = rubrics.find((item) => item.kind === kind);
  const child = rubrika && parent ? rubrics.find((item) => item.slug === rubrika && item.parent === parent.slug) : undefined;
  return (
    <ArticleIndex
      kind={kind}
      subrubric={child?.slug}
      eyebrow={child?.name ?? parent?.name ?? eyebrow}
      title={child?.name ?? title}
      lede={lede}
    />
  );
}
