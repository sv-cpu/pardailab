import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AboutCopy } from "@/components/about-copy";
import { ArticleCard } from "@/components/article-card";
import { Container } from "@/components/container";
import { bioPlainText, cleanStaffBio } from "@/lib/bio";
import { getArticles } from "@/lib/cms";
import { articleCountLabel } from "@/lib/rubrics";
import { pageMeta } from "@/lib/seo";
import { findUserBySlug, roleLabel } from "@/lib/users";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const user = findUserBySlug(slug);
  if (!user) return {};
  return pageMeta({ title: user.name, description: bioPlainText(user.bio) || user.name, path: `/avtory/${slug}` });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const user = findUserBySlug(slug);
  if (!user) notFound();
  const articles = (await getArticles()).filter((item) => item.authorSlug === user.slug);
  const bio = cleanStaffBio(user.bio);
  return (
    <Container className="py-16 sm:py-20">
      <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="grid size-32 shrink-0 place-items-center overflow-hidden rounded-full bg-olive-soft text-olive">
          {user.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photo} alt="" className="size-full object-cover" />
          ) : (
            <span className="font-heading text-4xl">{user.name.trim().slice(0, 1).toLocaleUpperCase("ru-RU")}</span>
          )}
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">{roleLabel[user.role]}</p>
          <h1 className="mt-3 font-heading text-4xl tracking-tight sm:text-5xl">{user.name}</h1>
        </div>
      </header>
      {bio ? <AboutCopy text={bio} className="mt-10 max-w-3xl" /> : null}
      {articles.length ? (
        <section className={bio ? "mt-16" : "mt-14"}>
          <h2 className="font-heading text-3xl tracking-tight">Материалы</h2>
          <p className="mt-2 text-sm text-muted-foreground">{articleCountLabel(articles.length)}</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
