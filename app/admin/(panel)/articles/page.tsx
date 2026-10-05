import { RecordList } from "@/components/admin/ui";
import { listArticles } from "@/lib/db";
import { kindLabel } from "@/lib/paths";
import { currentUser, ownsArticle } from "@/lib/users";

export default async function ArticlesPage() {
  const actor = await currentUser();
  const rows = listArticles()
    .filter((article) => !actor || actor.role === "editor" || ownsArticle(article, actor))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "ru"))
    .map((article) => ({
      slug: article.slug,
      title: article.title,
      meta: `${kindLabel[article.kind]} · ${article.date}`,
    }));
  return <RecordList title="Статьи" href="/admin/articles/new" rows={rows} />;
}
