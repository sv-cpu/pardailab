import { notFound } from "next/navigation";

import { saveArticleAction } from "@/app/admin/actions";
import { ArticleForm } from "@/components/admin/forms";
import { Notice } from "@/components/admin/ui";
import { listArticles } from "@/lib/db";
import { listRubrics } from "@/lib/rubrics";
import { articleHref } from "@/lib/paths";
import { currentUser, ownsArticle } from "@/lib/users";

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const article = listArticles().find((item) => item.slug === slug);
  const actor = await currentUser();
  if (!article || !actor || (actor.role !== "editor" && !ownsArticle(article, actor))) notFound();
  return (
    <div>
      <h1 className="mb-6 font-heading text-4xl tracking-tight">Статья</h1>
      <div className="mb-5">
        <Notice saved={query.saved} error={query.error} />
      </div>
      <ArticleForm article={article} rubrics={listRubrics()} action={saveArticleAction} publicHref={articleHref(article.kind, article.slug)} />
    </div>
  );
}
