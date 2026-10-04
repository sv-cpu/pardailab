import type { Metadata } from "next";

import { ArticleIndex } from "@/components/article-index";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Новости",
  description: "Новости искусственного интеллекта, в которых есть ответ на вопрос: почему это важно именно вам.",
  path: "/novosti",
});

export default function Page() {
  return (
    <ArticleIndex
      kind="news"
      eyebrow="Новости"
      title="Что произошло и зачем это вам"
      lede="Короткие разборы событий. Не лента заголовков, а последствие для человека, команды или бюджета."
    />
  );
}
