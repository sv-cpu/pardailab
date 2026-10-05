import type { Metadata } from "next";

import { SectionIndex } from "@/components/section-index";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Исследования",
  description: "Исследования PardAiLab: узкие проверки моделей и сервисов со статусом «Проверено PardAiLab».",
  path: "/issledovaniya",
});

export default async function Page({ searchParams }: { searchParams: Promise<{ rubrika?: string }> }) {
  const { rubrika } = await searchParams;
  return (
    <SectionIndex
      rubrika={rubrika}
      kind="research"
      eyebrow="Исследования PardAiLab"
      title="Собственные проверки, а не пересказ чужих"
      lede="У каждого материала есть номер, тема, дата и граница выборки. Статус «проверено» означает, что редакция прошла сценарий сама."
    />
  );
}
