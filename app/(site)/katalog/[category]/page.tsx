import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/container";
import { PageIntro } from "@/components/page-intro";
import { ServiceCard } from "@/components/service-card";
import { aiCategories, categoryBySlug } from "@/lib/categories";
import { getServices } from "@/lib/cms";
import { sortServices } from "@/lib/content/services";
import { pageMeta } from "@/lib/seo";
import type { Service } from "@/lib/types";

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return aiCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) return {};
  return pageMeta({
    title: category.label,
    description: category.description,
    path: `/katalog/${category.slug}`,
  });
}

export default async function Page({ params }: Props) {
  const { category: slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) notFound();
  const services = sortServices(await getServices()).filter((service) => service.categories.includes(category.slug));

  return (
    <Container className="py-16 sm:py-20">
      <Breadcrumbs
        items={[{ href: "/", label: "Главная" }, { href: "/katalog", label: "Каталог AI" }, { label: category.label }]}
      />
      <div className="mt-8">
        <PageIntro eyebrow="Каталог AI" title={category.label} lede={category.description} />
      </div>
      <div className="mt-12 space-y-5">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} similar={similarOf(service, services)} />
        ))}
      </div>
      {services.length === 0 ? (
        <p className="mt-10 text-muted-foreground">В этой области пока нет карточек.</p>
      ) : null}
      <p className="mt-8 text-sm">
        <Link href="/katalog" className="underline decoration-border underline-offset-4 hover:decoration-olive">
          Все области
        </Link>
      </p>
    </Container>
  );
}

function similarOf(service: Service, all: Service[]) {
  return service.similar
    .map((slug) => all.find((item) => item.slug === slug))
    .filter((item): item is Service => Boolean(item));
}
