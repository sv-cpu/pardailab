import Link from "next/link";

import { Cover } from "@/components/cover";
import { formatDate } from "@/lib/format";
import { articleHref, kindLabel } from "@/lib/paths";
import type { Article, ArticleKind } from "@/lib/types";

function meta(article: Article) {
  return `${article.author} · ${formatDate(article.date)}`;
}

export function LeadStory({ article }: { article: Article }) {
  const href = articleHref(article.kind, article.slug);
  return (
    <article>
      <Link href={href} className="block overflow-hidden rounded-2xl border border-border">
        <Cover id={article.cover} src={article.coverImage} alt="" priority />
      </Link>
      <p className="mt-5 font-mono text-[11px] tracking-[0.16em] text-olive uppercase">{article.category}</p>
      <h1 className="mt-3 font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
        <Link href={href} className="hover:text-olive">
          {article.title}
        </Link>
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{article.description}</p>
      <p className="mt-4 text-sm text-muted-foreground">{meta(article)}</p>
    </article>
  );
}

export function HeadlineList({ articles }: { articles: Article[] }) {
  return (
    <ol className="divide-y divide-border border-y border-border lg:border-t-0">
      {articles.map((article) => {
        const href = articleHref(article.kind, article.slug);
        return (
          <li key={`${article.kind}-${article.slug}`}>
            <article className="grid grid-cols-[5.5rem_1fr] gap-4 py-4">
              <Link href={href} className="overflow-hidden rounded-lg" tabIndex={-1} aria-hidden>
                <Cover id={article.cover} src={article.coverImage} alt="" />
              </Link>
              <div>
                <p className="font-mono text-[11px] tracking-[0.14em] text-olive uppercase">{kindLabel[article.kind]}</p>
                <h2 className="mt-1 font-heading text-lg leading-snug tracking-tight">
                  <Link href={href} className="hover:text-olive">
                    {article.title}
                  </Link>
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(article.date)}</p>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

const bandCopy: Record<ArticleKind, string> = {
  news: "Что произошло и зачем это вам.",
  practice: "Сценарии для человека, команды и бюджета.",
  development: "Как собирать агентов, поиск и свой контур.",
  research: "Сначала проверка, потом вывод.",
};

export function SectionBand({
  kind,
  href,
  articles,
}: {
  kind: ArticleKind;
  href: string;
  articles: Article[];
}) {
  if (!articles.length) return null;
  return (
    <section className="border-t border-border py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">{kindLabel[kind]}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{bandCopy[kind]}</p>
        </div>
        <Link href={href} className="text-sm underline decoration-border underline-offset-4 hover:decoration-olive">
          Все материалы
        </Link>
      </div>
      <div className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        {articles.map((article) => {
          const itemHref = articleHref(article.kind, article.slug);
          return (
            <article key={article.slug} className="group">
              <Link href={itemHref} className="block overflow-hidden rounded-xl border border-border" tabIndex={-1} aria-hidden>
                <Cover id={article.cover} src={article.coverImage} alt="" />
              </Link>
              <p className="mt-4 font-mono text-[11px] tracking-[0.14em] text-olive uppercase">{article.category}</p>
              <h3 className="mt-2 font-heading text-xl leading-snug tracking-tight">
                <Link href={itemHref} className="group-hover:text-olive">
                  {article.title}
                </Link>
              </h3>
              <p className="mt-3 text-xs text-muted-foreground">{meta(article)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
