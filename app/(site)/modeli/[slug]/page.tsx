import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { InquiryForm } from "@/components/inquiry-form";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { ScoreMeter } from "@/components/score-meter";
import { getModels } from "@/lib/cms";
import { sortModels } from "@/lib/content/models";
import { formatScore } from "@/lib/format";
import { modelRelease } from "@/lib/rating-view";
import { costHint, scoreFields } from "@/lib/scores";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const models = await getModels();
  return models.map((model) => ({ slug: model.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = (await getModels()).find((item) => item.slug === slug);
  if (!model) return {};
  return pageMeta({
    title: model.name,
    description: model.summary,
    path: `/modeli/${model.slug}`,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const models = sortModels(await getModels());
  const model = models.find((item) => item.slug === slug);
  if (!model) notFound();
  const others = models.filter((item) => item.slug !== slug).slice(0, 2);

  return (
    <Container className="py-16 sm:py-20">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Главная", path: "/" },
          { name: "Модели", path: "/modeli" },
          { name: model.name, path: `/modeli/${model.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Review",
          itemReviewed: { "@type": "SoftwareApplication", name: model.name, applicationCategory: "ArtificialIntelligence" },
          author: { "@type": "Organization", name: site.author },
          reviewBody: model.summary,
          reviewRating: {
            "@type": "Rating",
            ratingValue: model.scores.overall,
            bestRating: 10,
            worstRating: 0,
          },
        }}
      />
      <Breadcrumbs
        items={[{ href: "/", label: "Главная" }, { href: "/modeli", label: "Модели" }, { label: model.name }]}
      />
      <p className="mt-8 font-mono text-[11px] tracking-[0.18em] text-olive uppercase">{model.vendor}</p>
      <h1 className="mt-4 font-heading text-5xl tracking-tight sm:text-6xl">{model.name}</h1>
      {modelRelease(model) ? <p className="mt-3 font-mono text-lg text-olive">{modelRelease(model)}</p> : null}
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{model.summary}</p>
      <p className="mt-6 font-mono text-3xl text-olive">
        {formatScore(model.scores.overall)}
        <span className="ml-2 text-base text-muted-foreground">итог</span>
      </p>
      <div className="mt-10 grid max-w-3xl gap-5">
        {scoreFields.map(([key, label]) => (
          <ScoreMeter key={key} label={label} value={model.scores[key]} hint={key === "cost" ? costHint : undefined} />
        ))}
      </div>
      <div className="mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-2xl">Когда выбирать</h2>
          <p className="mt-3 leading-relaxed">{model.bestFor}</p>
        </section>
        <section className="rounded-2xl border border-border p-6">
          <h2 className="font-heading text-2xl">Когда не выбирать</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{model.avoidWhen}</p>
        </section>
      </div>
      <section className="mt-12">
        <h2 className="font-heading text-2xl">Рядом в шкале</h2>
        <ul className="mt-4 space-y-2">
          {others.map((item) => (
            <li key={item.slug}>
              <Link href={`/modeli/${item.slug}`} className="underline decoration-border underline-offset-4 hover:decoration-olive">
                {item.name}
              </Link>
              <span className="ml-2 font-mono text-sm text-muted-foreground">{formatScore(item.scores.overall)}</span>
            </li>
          ))}
        </ul>
      </section>
      <div className="mt-16 border-t border-border pt-8">
        <InquiryForm
          kind="correction"
          pageTitle={model.name}
          pagePath={`/modeli/${model.slug}`}
          title="Замечание к карточке"
          lede="Если оценка или описание расходятся с вашей задачей, напишите."
        />
      </div>
    </Container>
  );
}
