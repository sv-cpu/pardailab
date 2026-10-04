import type { Metadata } from "next";

import { ArticleIndex } from "@/components/article-index";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Практика",
  description: "Практические руководства: бизнес, ChatGPT, маркетинг, продажи, дом и учёба.",
  path: "/praktika",
});

export default function Page() {
  return (
    <ArticleIndex
      kind="practice"
      eyebrow="Практика"
      title="Как применить ИИ к своей задаче"
      lede="Сценарии для бизнеса, офиса, маркетинга, продаж, дома и учёбы. Каждый начинается с границы, а не с восторга."
    />
  );
}
