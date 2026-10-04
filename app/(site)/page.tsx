import Link from "next/link";

import { Container } from "@/components/container";
import { HeadlineList, LeadStory, SectionBand } from "@/components/home-feed";
import { aiCategories } from "@/lib/categories";
import { getArticles, getModels, getServices } from "@/lib/cms";
import { sortModels } from "@/lib/content/models";
import { sortServices } from "@/lib/content/services";
import { formatScore } from "@/lib/format";
import type { ArticleKind } from "@/lib/types";

const bands: { kind: ArticleKind; href: string }[] = [
  { kind: "news", href: "/novosti" },
  { kind: "practice", href: "/praktika" },
  { kind: "development", href: "/razrabotka" },
  { kind: "research", href: "/issledovaniya" },
];

export default async function HomePage() {
  const [articles, models, services] = await Promise.all([getArticles(), getModels(), getServices()]);
  const lead = articles[0];
  const rail = articles.filter((item) => item.slug !== lead?.slug).slice(0, 4);
  const leaders = sortModels(models).slice(0, 4);
  const picks = sortServices(services).slice(0, 3);

  return (
    <>
      {lead ? (
        <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.7fr)] lg:py-12">
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
            articles={articles.filter((item) => item.kind === band.kind && item.slug !== lead?.slug).slice(0, 4)}
          />
        ))}
      </Container>

      <Container className="border-t border-border py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">Модели</h2>
            <p className="mt-2 text-sm text-muted-foreground">Одна редакционная шкала, разные сильные стороны.</p>
          </div>
          <Link href="/modeli" className="text-sm underline decoration-border underline-offset-4 hover:decoration-olive">
            Вся матрица
          </Link>
        </div>
        <ol className="mt-8 divide-y divide-border border-y border-border">
          {leaders.map((model, index) => (
            <li key={model.slug} className="grid gap-2 py-5 sm:grid-cols-[4rem_1fr_auto] sm:items-baseline">
              <span className="font-mono text-sm text-olive">0{index + 1}</span>
              <div>
                <Link href={`/modeli/${model.slug}`} className="font-heading text-2xl hover:text-olive">
                  {model.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{model.bestFor}</p>
              </div>
              <span className="font-mono text-lg">{formatScore(model.scores.overall)}</span>
            </li>
          ))}
        </ol>
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
