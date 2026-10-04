import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { Container } from "@/components/container";
import { LabIllustration } from "@/components/lab-illustration";
import { SearchForm } from "@/components/search-form";
import { Button } from "@/components/ui/button";
import { aiCategories } from "@/lib/categories";
import { getArticles, getModels, getServices } from "@/lib/cms";
import { sortModels } from "@/lib/content/models";
import { sortServices } from "@/lib/content/services";
import { formatScore } from "@/lib/format";
import { site } from "@/lib/site";

export default async function HomePage() {
  const [articles, models, services] = await Promise.all([getArticles(), getModels(), getServices()]);
  const research = articles.filter((item) => item.kind === "research").slice(0, 3);
  const latest = articles.filter((item) => item.kind !== "research").slice(0, 3);
  const featured = research[0];
  const leaders = sortModels(models).slice(0, 4);
  const picks = sortServices(services).slice(0, 3);

  return (
    <>
      <Container className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-olive uppercase">Лаборатория прикладного ИИ</p>
          <h1 className="mt-5 font-serif text-6xl leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">PardAiLabs</h1>
          <p className="mt-6 max-w-xl text-xl leading-relaxed text-pretty text-muted-foreground sm:text-2xl">
            Практический искусственный интеллект для людей и бизнеса
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/materialy">Читать статьи</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/resheniya">Каталог решений</Link>
            </Button>
          </div>
        </div>
        <LabIllustration />
      </Container>

      <Container>
        <SearchForm large />
        <p className="mt-3 text-sm text-muted-foreground">
          Поиск сразу смотрит статьи, сервисы, модели и исследования.
        </p>
      </Container>

      <Container className="grid gap-10 py-20 md:grid-cols-3" id="metod">
        {[
          ["01", "Доверие", "Мы отделяем наблюдение от вывода и пишем, где проверка была узкой."],
          ["02", "Понятность", "Термин появляется вместе с задачей, в которой он нужен."],
          ["03", "Польза", "У материала есть адресат: человек, команда или бюджет."],
        ].map(([index, title, text]) => (
          <section key={index}>
            <p className="font-mono text-sm text-olive">{index}</p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight">{title}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{text}</p>
          </section>
        ))}
      </Container>

      <section className="border-y border-border bg-card">
        <Container className="py-20">
          <p className="font-mono text-[11px] tracking-[0.18em] text-olive uppercase">Исследования PardAiLabs</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <h2 className="max-w-2xl font-serif text-4xl tracking-tight sm:text-5xl">Сначала проверка, потом вывод</h2>
            <Link href="/issledovaniya" className="text-sm underline decoration-border underline-offset-4 hover:decoration-olive">
              Все исследования
            </Link>
          </div>
          {featured ? (
            <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <p className="font-serif text-6xl tracking-tight text-olive sm:text-7xl">№{featured.research?.number}</p>
              <div>
                <h3 className="font-serif text-3xl tracking-tight">
                  <Link href={`/issledovaniya/${featured.slug}`} className="hover:text-olive">
                    {featured.title}
                  </Link>
                </h3>
                <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{featured.description}</p>
              </div>
            </div>
          ) : null}
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {research.map((item) => (
              <ArticleCard key={item.slug} article={item} />
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-4xl tracking-tight">Свежие материалы</h2>
          <Link href="/materialy" className="text-sm underline decoration-border underline-offset-4 hover:decoration-olive">
            Все статьи
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {latest.map((item) => (
            <ArticleCard key={`${item.kind}-${item.slug}`} article={item} />
          ))}
        </div>
      </Container>

      <Container className="pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-olive uppercase">Рейтинг моделей</p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight">Одна шкала, разные сильные стороны</h2>
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
                <Link href={`/modeli/${model.slug}`} className="font-serif text-2xl hover:text-olive">
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
        <Container className="py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-4xl tracking-tight">Каталог решений</h2>
            <Link href="/resheniya" className="text-sm underline decoration-border underline-offset-4 hover:decoration-olive">
              Все сервисы
            </Link>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {picks.map((service) => (
              <article key={service.slug} className="rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-serif text-2xl">
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
          <h2 className="mt-16 font-serif text-3xl tracking-tight">Каталог AI по задачам</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {aiCategories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/katalog/${category.slug}`}
                  className="block rounded-2xl border border-border px-4 py-4 text-sm hover:border-olive"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="py-8 pb-20">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{site.description}</p>
      </Container>
    </>
  );
}
