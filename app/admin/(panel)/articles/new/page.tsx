import { saveArticleAction } from "@/app/admin/actions";
import { ArticleForm } from "@/components/admin/forms";
import { Notice } from "@/components/admin/ui";
import { listRubrics } from "@/lib/rubrics";

export default async function NewArticlePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  return (
    <div>
      <h1 className="mb-6 font-heading text-4xl tracking-tight">Новая статья</h1>
      <div className="mb-5">
        <Notice error={query.error} />
      </div>
      <ArticleForm rubrics={listRubrics()} action={saveArticleAction} />
    </div>
  );
}
