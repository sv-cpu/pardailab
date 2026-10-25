import type { MetadataRoute } from "next";

import { getArticles } from "@/lib/cms";
import { articleHref } from "@/lib/paths";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles();
  const staticPaths = [
    "",
    "/novosti",
    "/praktika",
    "/razrabotka",
    "/issledovaniya",
    "/materialy",
    "/poisk",
    "/o-proekte",
  ];

  return [
    ...staticPaths.map((path) => ({
      url: new URL(path || "/", site.url).toString(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...articles.map((article) => ({
      url: new URL(articleHref(article.kind, article.slug), site.url).toString(),
      lastModified: article.date,
      changeFrequency: "monthly" as const,
      priority: article.kind === "research" ? 0.9 : 0.6,
    })),
  ];
}
