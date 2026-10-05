import type { Metadata } from "next";

import { ArticleCard } from "@/components/article-card";
import { Container } from "@/components/container";
import { PageIntro } from "@/components/page-intro";
import { getArticles } from "@/lib/cms";
import { kindLabel } from "@/lib/paths";
import { pageMeta } from "@/lib/seo";
import type { ArticleKind } from "@/lib/types";

export const metadata: Metadata = pageMeta({
  title: "Статьи",
  description: "Новости, практика, разработка и исследования PardAiLab в одном указателе.",
  path: "/materialy",
});

const order: ArticleKind[] = ["research", "news", "practice", "development"];

export default async function Page() {
  const articles = await getArticles();
  return (
    <Container className="py-16 sm:py-20">
      <PageIntro
        eyebrow="Материалы"
        title="Читать лабораторию"
        lede="Исследования, новости, практика и разработка. Общее у текстов одно: после них понятно, что делать."
      />
      <div className="mt-14 space-y-14">
        {order.map((kind) => {
          const group = articles.filter((item) => item.kind === kind);
          if (!group.length) return null;
          return (
            <section key={kind}>
              <h2 className="font-heading text-3xl tracking-tight">{kindLabel[kind]}</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {group.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Container>
  );
}
