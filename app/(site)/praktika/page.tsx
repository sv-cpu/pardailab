import type { Metadata } from "next";

import { SectionIndex } from "@/components/section-index";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Практика",
  description: "Практические руководства: бизнес, ChatGPT, маркетинг, продажи, дом и учёба.",
  path: "/praktika",
});

export default async function Page({ searchParams }: { searchParams: Promise<{ rubrika?: string }> }) {
  const { rubrika } = await searchParams;
  return (
    <SectionIndex
      rubrika={rubrika}
      kind="practice"
      eyebrow="Практика"
      title="Как применить ИИ к своей задаче"
      lede="Сценарии для бизнеса, офиса, маркетинга, продаж, дома и учёбы. Каждый начинается с границы, а не с восторга."
    />
  );
}
