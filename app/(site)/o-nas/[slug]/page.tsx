import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AboutCopy } from "@/components/about-copy";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/container";
import { PageIntro } from "@/components/page-intro";
import {
  aboutDirectionHref,
  aboutDirectionSlugs,
  getAboutDirection,
  getAboutLab,
  type AboutDirectionSlug,
} from "@/lib/about";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return aboutDirectionSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const direction = getAboutDirection(slug);
  if (!direction) return {};
  return pageMeta({
    title: `${direction.title} — О нас`,
    description: direction.lede,
    path: aboutDirectionHref(direction.slug),
  });
}

export default async function AboutDirectionPage({ params }: Props) {
  const { slug } = await params;
  const direction = getAboutDirection(slug);
  if (!direction) notFound();
  const about = getAboutLab();
  const others = about.directions.filter((item) => item.slug !== direction.slug);

  return (
    <Container className="py-16 sm:py-20">
      <Breadcrumbs
        items={[
          { href: "/", label: "Главная" },
          { href: "/o-nas", label: "О нас" },
          { label: direction.title },
        ]}
      />
      <div className="mt-8">
        <PageIntro eyebrow="О нас" title={direction.title} lede={direction.lede} />
      </div>

      {direction.image ? (
        <div className="relative mt-10 aspect-[16/9] max-w-4xl overflow-hidden bg-[#f4f2ec]">
          <Image
            src={direction.image}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
            unoptimized={direction.image.startsWith("/uploads/")}
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mt-10 max-w-2xl">
        <AboutCopy text={direction.body} />
      </div>

      <div className="mt-12 max-w-2xl border-t border-border pt-8">
        <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">Другие направления</p>
        <ul className="mt-4 space-y-3">
          {others.map((item) => (
            <li key={item.slug}>
              <Link
                href={aboutDirectionHref(item.slug as AboutDirectionSlug)}
                className="font-heading text-xl tracking-tight hover:text-olive"
              >
                {item.title}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/o-nas" className="text-sm underline decoration-border underline-offset-4 hover:decoration-olive">
              Ко всей лаборатории
            </Link>
          </li>
        </ul>
      </div>
    </Container>
  );
}
