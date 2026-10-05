import { Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/container";
import { Cover } from "@/components/cover";
import { JsonLd } from "@/components/json-ld";
import { getArticles } from "@/lib/cms";
import { formatDate } from "@/lib/format";
import { articleHref, kindLabel } from "@/lib/paths";
import { relatedArticles } from "@/lib/related";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import type { ArticleKind, Block } from "@/lib/types";

import { ShareBar } from "./share-bar";

const roots: Record<ArticleKind, string> = {
  news: "/novosti",
  practice: "/praktika",
  development: "/razrabotka",
  research: "/issledovaniya",
};

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="max-w-3xl">
      {blocks.map((block, index) => {
        if (block.type === "h2") {
          return (
            <h2 key={index} className="mt-12 font-heading text-3xl tracking-tight">
              {block.text}
            </h2>
          );
        }
        if (block.type === "p") {
          return (
            <p key={index} className="mt-5 font-serif text-lg leading-8 text-pretty">
              {block.text}
            </p>
          );
        }
        if (block.type === "ul" || block.type === "ol") {
          const Tag = block.type === "ol" ? "ol" : "ul";
          return (
            <Tag
              key={index}
              className={`mt-5 space-y-2 pl-5 font-serif text-lg leading-8 ${block.type === "ol" ? "list-decimal" : "list-disc"}`}
            >
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </Tag>
          );
        }
        if (block.type === "html") {
          return <div key={index} className="article-html" dangerouslySetInnerHTML={{ __html: block.html }} />;
        }
        return (
          <aside key={index} className="mt-8 rounded-2xl border border-border bg-card px-5 py-4">
            <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">{block.title}</p>
            <p className="mt-2 text-sm leading-relaxed">{block.text}</p>
          </aside>
        );
      })}
    </div>
  );
}

export async function ArticleScreen({ kind, slug }: { kind: ArticleKind; slug: string }) {
  const articles = await getArticles();
  const article = articles.find((item) => item.kind === kind && item.slug === slug);
  if (!article) notFound();
  const related = relatedArticles(articles, article);
  const pageUrl = new URL(articleHref(kind, slug), site.url).toString();
  const crumbs = [
    { name: "Главная", path: "/" },
    { name: kindLabel[kind], path: roots[kind] },
    { name: article.title, path: articleHref(kind, slug) },
  ];

  return (
    <Container className="py-12 sm:py-16">
      <JsonLd data={articleJsonLd(article)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs
        items={[
          { href: "/", label: "Главная" },
          { href: roots[kind], label: kindLabel[kind] },
          { label: article.title },
        ]}
      />
      {article.research ? (
        <section className="mt-8 max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
          <p className="font-mono text-xs tracking-[0.16em] text-olive uppercase">
            Исследование №{article.research.number}
          </p>
          <h2 className="mt-5 font-heading text-2xl">Тема</h2>
          <p className="mt-2 text-lg leading-relaxed">{article.research.topic}</p>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Дата</dt>
              <dd className="mt-2">{formatDate(article.date)}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Статус</dt>
              <dd className="mt-2">
                <Badge>
                  <Check className="size-3.5" aria-hidden />
                  Проверено PardAiLabs
                </Badge>
              </dd>
            </div>
          </dl>
        </section>
      ) : null}
      <div className="mt-8 max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">{article.category}</p>
        <h1 className="mt-4 font-heading text-4xl leading-[1.12] tracking-tight text-balance sm:text-5xl">
          {article.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground">{article.description}</p>
        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {article.research ? null : (
            <div>
              <dt className="sr-only">Дата</dt>
              <dd>{formatDate(article.date)}</dd>
            </div>
          )}
          <div>
            <dt className="sr-only">Автор</dt>
            <dd>
              {article.authorSlug ? (
                <Link href={`/avtory/${article.authorSlug}`} className="hover:text-olive">
                  {article.author}
                </Link>
              ) : (
                article.author
              )}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Время чтения</dt>
            <dd>{article.readingMinutes} мин чтения</dd>
          </div>
        </dl>
        <div className="mt-6">
          <ShareBar url={pageUrl} title={article.title} />
        </div>
      </div>
      <Cover id={article.cover} src={article.coverImage} alt={`Обложка: ${article.title}`} priority className="mt-10 max-w-5xl rounded-2xl" />
      {article.whyItMatters ? (
        <aside className="mt-10 max-w-3xl border-l-2 border-olive pl-5">
          <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">Почему это важно именно вам</p>
          <p className="mt-3 text-lg leading-relaxed">{article.whyItMatters}</p>
        </aside>
      ) : null}
      <div className="mt-4">
        <Blocks blocks={article.body} />
      </div>
      <div className="mt-10 max-w-3xl border-t border-border pt-6">
        <ShareBar url={pageUrl} title={article.title} />
      </div>
      {related.length ? (
        <section className="mt-20">
          <h2 className="font-heading text-3xl tracking-tight">Похожие материалы</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <ArticleCard key={`${item.kind}-${item.slug}`} article={item} />
            ))}
          </div>
          <p className="mt-6 text-sm">
            <Link href={roots[kind]} className="underline decoration-border underline-offset-4 hover:decoration-olive">
              Все материалы раздела «{kindLabel[kind]}»
            </Link>
          </p>
        </section>
      ) : null}
    </Container>
  );
}
