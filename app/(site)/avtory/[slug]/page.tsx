import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { Container } from "@/components/container";
import { getArticles } from "@/lib/cms";
import { pageMeta } from "@/lib/seo";
import { findUserBySlug, roleLabel } from "@/lib/users";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const user = findUserBySlug(slug);
  if (!user) return {};
  return pageMeta({ title: user.name, description: user.bio || user.name, path: `/avtory/${slug}` });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const user = findUserBySlug(slug);
  if (!user) notFound();
  const articles = (await getArticles()).filter((item) => item.authorSlug === user.slug);
  return (
    <Container className="py-16 sm:py-20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {user.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photo} alt="" className="size-32 object-cover" />
        ) : null}
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">{roleLabel[user.role]}</p>
          <h1 className="mt-3 font-heading text-4xl tracking-tight sm:text-5xl">{user.name}</h1>
          {user.bio ? <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{user.bio}</p> : null}
        </div>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </Container>
  );
}
