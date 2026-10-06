import Link from "next/link";

import { Container } from "@/components/container";
import { HomeScale } from "@/components/home-scale";
import { HeadlineList, LeadStory, SectionBand } from "@/components/home-feed";
import { aiCategories } from "@/lib/categories";
import { getArticles, getModels, getServices } from "@/lib/cms";
import { sortServices } from "@/lib/content/services";
import { formatScore } from "@/lib/format";
import { matchesKind, placementLabel } from "@/lib/placements";
import { ratingStamp } from "@/lib/rating";
import { listRubrics } from "@/lib/rubrics";
import type { ArticleKind } from "@/lib/types";

const bands: { kind: ArticleKind; href: string }[] = [
  { kind: "news", href: "/novosti" },
  { kind: "practice", href: "/praktika" },
  { kind: "development", href: "/razrabotka" },
  { kind: "research", href: "/issledovaniya" },
];

export default async function HomePage() {
  const [articles, models, services, rubrics] = await Promise.all([getArticles(), getModels(), getServices(), listRubrics()]);
  const lead = articles[0];
  const rail = articles.filter((item) => item.slug !== lead?.slug).slice(0, 4);
  const picks = sortServices(services).slice(0, 3);
  const rating = ratingStamp();

  return (
    <>
      {lead ? (
        <Container className="grid items-start gap-8 py-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)] lg:gap-12 lg:py-10">
          <LeadStory article={lead} />
          <HeadlineList articles={rail} />
        </Container>
      ) : null}

      <Container>
        {bands.map((band) => (
          <SectionBand
            key={band.kind}
            kind={band.kind}
            href={band.href}
            articles={articles
              .filter((item) => matchesKind(item, band.kind, rubrics) && item.slug !== lead?.slug)
              .slice(0, 4)
              .map((item) => ({
                ...item,
                category: placementLabel(item, rubrics, rubrics.find((rubric) => rubric.kind === band.kind)?.slug),
              }))}
          />
        ))}
      </Container>

      <Container className="py-12">
        <HomeScale models={models} updated={rating.updated} />
      </Container>

      <section className="border-t border-border">
        <Container className="py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">Каталог решений</h2>
            <Link href="/resheniya" className="text-sm underline decoration-border underline-offset-4 hover:decoration-olive">
              Все сервисы
            </Link>
          </div>
          <div className="mt-8 grid gap-8 border-t border-border lg:grid-cols-3">
            {picks.map((service) => (
              <article key={service.slug} className="border-b border-border py-6 lg:border-b-0 lg:border-r lg:pr-8 lg:last:border-r-0">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-heading text-2xl">
                    <Link href={`/resheniya/${service.slug}`} className="hover:text-olive">
                      {service.name}
                    </Link>
                  </h3>
                  <span className="font-mono text-sm text-olive">{formatScore(service.rating)}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
              </article>
            ))}
          </div>
          <h2 className="mt-16 font-heading text-3xl tracking-tight">Каталог AI по задачам</h2>
          <ul className="mt-6 grid border-t border-border sm:grid-cols-2 lg:grid-cols-5">
            {aiCategories.map((category) => (
              <li key={category.slug} className="border-b border-border">
                <Link href={`/katalog/${category.slug}`} className="block py-4 pr-4 text-sm hover:text-olive">
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
