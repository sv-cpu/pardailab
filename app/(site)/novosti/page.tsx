import type { Metadata } from "next";

import { SectionIndex } from "@/components/section-index";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Новости",
  description: "Новости искусственного интеллекта, в которых есть ответ на вопрос: почему это важно именно вам.",
  path: "/novosti",
});

export default async function Page({ searchParams }: { searchParams: Promise<{ rubrika?: string }> }) {
  const { rubrika } = await searchParams;
  return (
    <SectionIndex
      rubrika={rubrika}
      kind="news"
      eyebrow="Новости"
      title="Что произошло и зачем это вам"
      lede="Короткие разборы событий. Не лента заголовков, а последствие для человека, команды или бюджета."
    />
  );
}
