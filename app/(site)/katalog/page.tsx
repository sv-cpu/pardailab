import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { PageIntro } from "@/components/page-intro";
import { aiCategories } from "@/lib/categories";
import { getServices } from "@/lib/cms";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Каталог AI",
  description:
    "Каталог искусственного интеллекта по задачам: текст, видео, изображения, музыка, автоматизация, программирование, поиск, голос, бизнес и образование.",
  path: "/katalog",
});

export default async function Page() {
  const services = await getServices();
  return (
    <Container className="py-16 sm:py-20">
      <PageIntro
        eyebrow="Каталог AI"
        title="Сначала задача, потом сервис"
        lede="Десять областей. Внутри — те же карточки каталога решений, без отдельной витрины «всё подряд»."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {aiCategories.map((category) => {
          const count = services.filter((service) => service.categories.includes(category.slug)).length;
          return (
            <Link
              key={category.slug}
              href={`/katalog/${category.slug}`}
              className="rounded-2xl border border-border bg-card p-6 hover:border-olive"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-serif text-3xl tracking-tight">{category.label}</h2>
                <span className="font-mono text-sm text-olive">{count}</span>
              </div>
              <p className="mt-3 leading-relaxed text-muted-foreground">{category.description}</p>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
