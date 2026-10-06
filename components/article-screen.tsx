import { Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/container";
import { Cover } from "@/components/cover";
import { JsonLd } from "@/components/json-ld";
import { getArticles } from "@/lib/cms";
import { formatPublished } from "@/lib/format";
import { articleOutline, stampHeadingIds } from "@/lib/outline";
import { articleHref, kindLabel } from "@/lib/paths";
import { placementLabels } from "@/lib/placements";
import { listRubrics } from "@/lib/rubrics";
import { relatedArticles } from "@/lib/related";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import type { Article, ArticleKind, Block } from "@/lib/types";
import { findUserBySlug, roleLabel } from "@/lib/users";

import { ShareBar } from "./share-bar";

const roots: Record<ArticleKind, string> = {
  news: "/novosti",
  practice: "/praktika",
  development: "/razrabotka",
  research: "/issledovaniya",
};

function blockNodes(blocks: Block[]) {
  let heading = 0;
  return blocks.map((block, index) => {
    if (block.type === "h2") {
      heading += 1;
      return (
        <h2 id={`razdel-${heading}`} key={index} className="mt-12 scroll-mt-24 font-heading text-3xl tracking-tight">
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
      const stamped = stampHeadingIds(block.html, heading);
      heading = stamped.count;
      return <div key={index} className="article-html" dangerouslySetInnerHTML={{ __html: stamped.html }} />;
    }
    return (
      <aside key={index} className="mt-8 rounded-2xl border border-border bg-card px-5 py-4">
        <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">{block.title}</p>
        <p className="mt-2 text-sm leading-relaxed">{block.text}</p>
      </aside>
    );
  });
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return <div className="max-w-3xl">{blockNodes(blocks)}</div>;
}

function AuthorLine({ article }: { article: Article }) {
  const user = article.authorSlug ? findUserBySlug(article.authorSlug) : null;
  const name = user?.name || article.author;
  const letter = name.trim().slice(0, 1).toLocaleUpperCase("ru-RU") || "П";
  const body = (
    <>
      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-olive-soft font-heading text-olive">
        {user?.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photo} alt="" className="size-full object-cover" />
        ) : (
          letter
        )}
      </span>
      <span>
        <span className="block text-sm text-foreground">{name}</span>
        <span className="block text-xs text-muted-foreground">
          {user ? `${roleLabel[user.role]} · ` : ""}
          {article.research ? null : `${formatPublished(article.date)} · `}
          {article.readingMinutes} мин чтения
        </span>
      </span>
    </>
  );
  if (!article.authorSlug) return <div className="flex items-center gap-3">{body}</div>;
  return (
    <Link href={`/avtory/${article.authorSlug}`} className="flex items-center gap-3 hover:text-olive">
      {body}
    </Link>
  );
}

export async function ArticleScreen({ kind, slug }: { kind: ArticleKind; slug: string }) {
  const articles = await getArticles();
  const article = articles.find((item) => item.kind === kind && item.slug === slug);
  if (!article) notFound();
  const related = relatedArticles(articles, article);
  const next = related[0];
  const outline = articleOutline(article.body);
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
      <div className="mt-8 max-w-5xl">
        <Cover id={article.cover} src={article.coverImage} alt="" priority className="rounded-2xl" />
        <div className="mt-8 max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">
            {article.research ? `Исследование №${article.research.number}` : placementLabels(article, listRubrics())}
          </p>
          <h1 className="mt-4 font-heading text-4xl leading-[1.12] tracking-tight text-balance sm:text-5xl">{article.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground">{article.description}</p>
          <div className="mt-6">
            <AuthorLine article={article} />
          </div>
        </div>
      </div>
      {article.research ? (
        <section className="mt-8 max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-heading text-2xl">Тема</h2>
          <p className="mt-2 text-lg leading-relaxed">{article.research.topic}</p>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Дата</dt>
              <dd className="mt-2">{formatPublished(article.date)}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Статус</dt>
              <dd className="mt-2">
                <Badge>
                  <Check className="size-3.5" aria-hidden />
                  Проверено PardAiLab
                </Badge>
              </dd>
            </div>
          </dl>
        </section>
      ) : null}
      <div className={outline.length > 1 ? "mt-10 xl:grid xl:grid-cols-[14rem_minmax(0,42rem)] xl:items-start xl:gap-12" : "mt-10"}>
        {outline.length > 1 ? (
          <nav className="mb-8 xl:sticky xl:top-24 xl:mb-0" aria-label="Содержание">
            <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">В этом материале</p>
            <ol className="mt-3 space-y-2 text-sm">
              {outline.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-muted-foreground hover:text-foreground">
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div>
          {article.whyItMatters ? (
            <aside className="max-w-3xl border-l-2 border-olive pl-5">
              <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">Почему это важно именно вам</p>
              <p className="mt-3 text-lg leading-relaxed">{article.whyItMatters}</p>
            </aside>
          ) : null}
          <Blocks blocks={article.body} />
          <div className="mt-10 max-w-3xl border-t border-border pt-6">
            <ShareBar url={pageUrl} title={article.title} />
          </div>
        </div>
      </div>
      {next ? (
        <section className="mt-16 max-w-3xl border-t border-border pt-8">
          <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">Дальше</p>
          <article className="mt-4 grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[11rem_minmax(0,1fr)]">
            <Link href={articleHref(next.kind, next.slug)} className="block overflow-hidden rounded-xl" tabIndex={-1} aria-hidden>
              <Cover id={next.cover} src={next.coverImage} alt="" />
            </Link>
            <div>
              <h2 className="font-heading text-2xl leading-snug tracking-tight">
                <Link href={articleHref(next.kind, next.slug)} className="hover:text-olive">
                  {next.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{next.description}</p>
            </div>
          </article>
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
