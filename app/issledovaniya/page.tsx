import type { Metadata } from "next";

import { ArticleIndex } from "@/components/article-index";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Исследования",
  description: "Исследования PardAiLabs: узкие проверки моделей и сервисов со статусом «Проверено PardAiLabs».",
  path: "/issledovaniya",
});

export default function Page() {
  return (
    <ArticleIndex
      kind="research"
      eyebrow="Исследования PardAiLabs"
      title="Собственные проверки, а не пересказ чужих"
      lede="У каждого материала есть номер, тема, дата и граница выборки. Статус «проверено» означает, что редакция прошла сценарий сама."
    />
  );
}
