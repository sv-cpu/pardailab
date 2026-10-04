import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { PageIntro } from "@/components/page-intro";
import { SearchForm } from "@/components/search-form";
import { getArticles, getModels, getServices } from "@/lib/cms";
import { searchCatalog } from "@/lib/search";
import { pageMeta } from "@/lib/seo";
import type { SearchHit } from "@/lib/search";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q = "" } = await searchParams;
  return pageMeta({
    title: q ? `Поиск: ${q}` : "Поиск",
    description: "Поиск по статьям, сервисам, моделям и исследованиям PardAiLabs.",
    path: q ? `/poisk?q=${encodeURIComponent(q)}` : "/poisk",
    noIndex: Boolean(q),
  });
}

function Group({ title, items }: { title: string; items: SearchHit[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="font-heading text-3xl tracking-tight">
        {title}
        <span className="ml-3 font-mono text-base text-olive">{items.length}</span>
      </h2>
      <ul className="mt-5 divide-y divide-border border-y border-border">
        {items.map((item) => (
          <li key={item.href} className="py-5">
            <p className="font-mono text-[11px] tracking-[0.14em] text-olive uppercase">{item.kind}</p>
            <h3 className="mt-2 font-heading text-2xl">
              <Link href={item.href} className="hover:text-olive">
                {item.title}
              </Link>
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function Page({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const [articles, services, models] = await Promise.all([getArticles(), getServices(), getModels()]);
  const result = searchCatalog(q, { articles, services, models });
  const total = result.articles.length + result.services.length + result.models.length;

  return (
    <Container className="py-16 sm:py-20">
      <PageIntro
        eyebrow="Поиск"
        title="Один запрос на всю лабораторию"
        lede="Строка ищет одновременно статьи, сервисы, модели и исследования."
      />
      <div className="mt-10 max-w-3xl">
        <SearchForm large defaultValue={q} />
      </div>
      {q && total === 0 ? (
        <p className="mt-10 max-w-2xl text-lg text-muted-foreground">
          По запросу «{q}» ничего не нашлось. Попробуйте «договор», «код» или «голос» — или откройте подбор справа внизу.
        </p>
      ) : null}
      {!q ? (
        <ul className="mt-12 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["/issledovaniya", "Исследования"],
            ["/resheniya", "Сервисы"],
            ["/modeli", "Модели"],
            ["/materialy", "Статьи"],
          ].map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="block rounded-2xl border border-border px-4 py-4 hover:border-olive">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-12 space-y-12">
          <Group title="Материалы и исследования" items={result.articles} />
          <Group title="Сервисы" items={result.services} />
          <Group title="Модели" items={result.models} />
        </div>
      )}
    </Container>
  );
}
