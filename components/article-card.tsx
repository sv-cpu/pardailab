import Link from "next/link";

import { Cover } from "@/components/cover";
import { articleHref } from "@/lib/paths";
import type { Article } from "@/lib/types";

export function ArticleCard({ article, category }: { article: Article; category?: string }) {
  const href = articleHref(article.kind, article.slug);
  const label = category ?? article.category;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <Cover id={article.cover} src={article.coverImage} alt="" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-mono tracking-[0.14em] text-olive uppercase">{label}</span>
          <span className="text-muted-foreground">{article.readingMinutes} мин</span>
        </div>
        {article.research ? (
          <p className="mt-4 font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
            Исследование №{article.research.number}
          </p>
        ) : null}
        <h2 className="mt-3 font-heading text-2xl leading-snug tracking-tight">
          <Link href={href} className="after:absolute after:inset-0 group-hover:text-olive">
            {article.title}
          </Link>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-pretty text-muted-foreground">{article.description}</p>
      </div>
    </article>
  );
}
