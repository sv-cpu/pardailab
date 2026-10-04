import type { Metadata } from "next";

import { ArticleScreen } from "@/components/article-screen";
import { getArticles } from "@/lib/cms";
import { articleMeta } from "@/lib/seo";
import type { ArticleKind } from "@/lib/types";

export async function articleStaticParams(kind: ArticleKind) {
  const articles = await getArticles();
  return articles.filter((item) => item.kind === kind).map((item) => ({ slug: item.slug }));
}

export async function articleMetadata(kind: ArticleKind, slug: string): Promise<Metadata> {
  const articles = await getArticles();
  const article = articles.find((item) => item.kind === kind && item.slug === slug);
  if (!article) return {};
  return articleMeta(article);
}

export function ArticleRoute({ kind, slug }: { kind: ArticleKind; slug: string }) {
  return <ArticleScreen kind={kind} slug={slug} />;
}
