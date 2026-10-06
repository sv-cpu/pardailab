import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { InquiryForm } from "@/components/inquiry-form";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { ServiceCard } from "@/components/service-card";
import { getServices } from "@/lib/cms";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import type { Service } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = (await getServices()).find((item) => item.slug === slug);
  if (!service) return {};
  return pageMeta({ title: service.name, description: service.description, path: `/resheniya/${service.slug}` });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const services = await getServices();
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  const similar = service.similar
    .map((item) => services.find((candidate) => candidate.slug === item))
    .filter((item): item is Service => Boolean(item));

  return (
    <Container className="py-16 sm:py-20">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Главная", path: "/" },
          { name: "Каталог решений", path: "/resheniya" },
          { name: service.name, path: `/resheniya/${service.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Review",
          itemReviewed: { "@type": "SoftwareApplication", name: service.name, url: service.website },
          author: { "@type": "Organization", name: site.author },
          reviewBody: service.description,
          reviewRating: { "@type": "Rating", ratingValue: service.rating, bestRating: 10, worstRating: 0 },
        }}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "Главная" },
          { href: "/resheniya", label: "Каталог решений" },
          { label: service.name },
        ]}
      />
      <div className="mt-8">
        <ServiceCard service={service} similar={similar} />
      </div>
      <p className="mt-8 text-sm">
        <Link href="/resheniya" className="underline decoration-border underline-offset-4 hover:decoration-olive">
          Весь каталог решений
        </Link>
      </p>
      <div className="mt-16 border-t border-border pt-8">
        <InquiryForm
          kind="correction"
          pageTitle={service.name}
          pagePath={`/resheniya/${service.slug}`}
          title="Замечание к карточке"
          lede="Если описание сервиса не сходится, напишите."
        />
      </div>
    </Container>
  );
}
