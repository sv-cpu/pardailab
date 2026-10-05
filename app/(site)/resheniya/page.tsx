import type { Metadata } from "next";

import { Container } from "@/components/container";
import { PageIntro } from "@/components/page-intro";
import { ServiceCard } from "@/components/service-card";
import { getServices } from "@/lib/cms";
import { sortServices } from "@/lib/content/services";
import { pageMeta } from "@/lib/seo";
import type { Service } from "@/lib/types";

export const metadata: Metadata = pageMeta({
  title: "Каталог решений",
  description:
    "Каталог AI-сервисов PardAiLab: описание, ориентир цены, рейтинг, плюсы, минусы, область применения и похожие инструменты.",
  path: "/resheniya",
});

function similarOf(service: Service, all: Service[]) {
  return service.similar
    .map((slug) => all.find((item) => item.slug === slug))
    .filter((item): item is Service => Boolean(item));
}

export default async function Page() {
  const services = sortServices(await getServices());
  return (
    <Container className="py-16 sm:py-20">
      <PageIntro
        eyebrow="Каталог решений"
        title="Сервисы, которые можно сравнить спокойно"
        lede="У каждой карточки есть цена-ориентир, сильные и слабые стороны и официальный сайт. Знак на карточке — наш, не логотип компании."
      />
      <div className="mt-12 space-y-5">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} similar={similarOf(service, services)} />
        ))}
      </div>
    </Container>
  );
}
