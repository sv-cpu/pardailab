import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AboutCopy } from "@/components/about-copy";
import { Container } from "@/components/container";
import { InquiryForm } from "@/components/inquiry-form";
import { aboutDirectionHref, getAboutLab } from "@/lib/about";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const about = getAboutLab();
  return pageMeta({
    title: "О нас",
    description: about.lede,
    path: "/o-nas",
  });
}

export default function AboutPage() {
  const about = getAboutLab();
  return (
    <>
      <Container className="py-16 sm:py-20">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.18em] text-olive uppercase">{about.eyebrow}</p>
          <h1 className="mt-4 font-heading text-5xl leading-[1.08] tracking-tight text-balance sm:text-6xl">{about.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">{about.lede}</p>
          <p className="mt-8 font-mono text-sm tracking-[0.12em] text-olive uppercase">{about.slogan}</p>
          <p className="mt-8">
            <Link
              href="#svyaz"
              className="inline-flex rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep"
            >
              Связаться с лабораторией
            </Link>
          </p>
        </div>

        {about.image ? (
          <div className="relative mt-12 aspect-[16/9] overflow-hidden bg-[#f4f2ec] sm:mt-16">
            <Image
              src={about.image}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 960px, 100vw"
              unoptimized={about.image.startsWith("/uploads/")}
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="mt-14 max-w-2xl sm:mt-16">
          <AboutCopy text={about.body} />
        </div>

        <section className="mt-16 sm:mt-20">
          <h2 className="font-heading text-3xl tracking-tight">Четыре направления</h2>
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {about.directions.map((item) => (
              <li key={item.slug} className="py-6">
                <Link href={aboutDirectionHref(item.slug)} className="group block max-w-3xl">
                  <h3 className="font-heading text-2xl tracking-tight group-hover:text-olive sm:text-3xl">{item.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{item.teaser}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 max-w-2xl sm:mt-20">
          <h2 className="font-heading text-3xl tracking-tight">{about.methodTitle}</h2>
          <AboutCopy text={about.methodBody} className="mt-5" />
        </section>

        <div className="mt-16 border-t border-border pt-10 sm:mt-20">
          <InquiryForm
            id="svyaz"
            kind="letter"
            pageTitle="О нас"
            pagePath="/o-nas"
            title={about.contactTitle}
            lede={about.contactLede}
          />
        </div>
      </Container>
    </>
  );
}
