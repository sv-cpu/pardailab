import type { Metadata } from "next";

import { SectionIndex } from "@/components/section-index";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Разработка",
  description: "Понятные объяснения AI-агентов, MCP, RAG, API, OpenRouter, Cursor, LangGraph, n8n и архитектуры.",
  path: "/razrabotka",
});

export default async function Page({ searchParams }: { searchParams: Promise<{ rubrika?: string }> }) {
  const { rubrika } = await searchParams;
  return (
    <SectionIndex
      rubrika={rubrika}
      kind="development"
      eyebrow="Разработка"
      title="Инструменты без тумана"
      lede="Агенты, MCP, RAG, API, OpenRouter, Cursor, LangGraph и n8n — на языке задачи, которую они закрывают."
    />
  );
}
