import type { Metadata } from "next";

import { Container } from "@/components/container";
import { PageIntro } from "@/components/page-intro";
import { SearchForm } from "@/components/search-form";
import { SearchHitList } from "@/components/search-hits";
import { getArticles, getModels, getServices } from "@/lib/cms";
import { searchCatalog } from "@/lib/search";
import { pageMeta } from "@/lib/seo";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q = "" } = await searchParams;
  return pageMeta({
    title: q ? `Поиск: ${q}` : "Поиск",
    description: "Поиск по статьям, сервисам, моделям и исследованиям PardAiLab.",
    path: q ? `/poisk?q=${encodeURIComponent(q)}` : "/poisk",
    noIndex: Boolean(q),
  });
}

export default async function Page({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const [articles, services, models] = await Promise.all([getArticles(), getServices(), getModels()]);
  const hits = q.trim() ? searchCatalog(q, { articles, services, models }) : [];

  return (
    <Container className="py-16 sm:py-20">
      <PageIntro
        eyebrow="Поиск"
        title="Найдите по словам, которые помните"
        lede="Одна строка по статьям, исследованиям, сервисам и моделям."
      />
      <div className="mt-10 max-w-3xl">
        <SearchForm large defaultValue={q} />
      </div>
      {!q.trim() ? (
        <p className="mt-6 max-w-2xl text-muted-foreground">Наберите слова, которые помните.</p>
      ) : hits.length === 0 ? (
        <p className="mt-10 max-w-2xl text-lg text-muted-foreground">
          По запросу «{q}» ничего не нашлось. Попробуйте «договор», «код» или «голос».
        </p>
      ) : (
        <div className="mt-10">
          <SearchHitList hits={hits} query={q} />
        </div>
      )}
    </Container>
  );
}
