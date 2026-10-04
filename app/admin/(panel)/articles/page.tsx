import { RecordList } from "@/components/admin/ui";
import { listArticles } from "@/lib/db";
import { kindLabel } from "@/lib/paths";

export default function ArticlesPage() {
  const rows = listArticles()
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "ru"))
    .map((article) => ({
      slug: article.slug,
      title: article.title,
      meta: `${kindLabel[article.kind]} · ${article.date}`,
    }));
  return <RecordList title="Статьи" href="/admin/articles/new" rows={rows} />;
}
