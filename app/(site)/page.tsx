import { Container } from "@/components/container";
import { HeadlineList, LeadStory, SectionBand } from "@/components/home-feed";
import { getArticles } from "@/lib/cms";
import { matchesKind, placementLabel } from "@/lib/placements";
import { listRubrics } from "@/lib/rubrics";
import type { ArticleKind } from "@/lib/types";

const bands: { kind: ArticleKind; href: string }[] = [
  { kind: "news", href: "/novosti" },
  { kind: "practice", href: "/praktika" },
  { kind: "development", href: "/razrabotka" },
  { kind: "research", href: "/issledovaniya" },
];

export default async function HomePage() {
  const [articles, rubrics] = await Promise.all([getArticles(), listRubrics()]);
  const lead = articles[0];
  const rail = articles.filter((item) => item.slug !== lead?.slug).slice(0, 4);

  return (
    <>
      {lead ? (
        <Container className="grid items-start gap-8 py-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)] lg:gap-12 lg:py-10">
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
            articles={articles
              .filter((item) => matchesKind(item, band.kind, rubrics) && item.slug !== lead?.slug)
              .slice(0, 4)
              .map((item) => ({
                ...item,
                category: placementLabel(item, rubrics, rubrics.find((rubric) => rubric.kind === band.kind)?.slug),
              }))}
          />
        ))}
      </Container>
    </>
  );
}
