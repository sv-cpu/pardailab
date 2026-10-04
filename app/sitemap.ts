import type { MetadataRoute } from "next";

import { aiCategories } from "@/lib/categories";
import { getArticles, getModels, getServices } from "@/lib/cms";
import { articleHref } from "@/lib/paths";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, models, services] = await Promise.all([getArticles(), getModels(), getServices()]);
  const staticPaths = [
    "",
    "/novosti",
    "/praktika",
    "/resheniya",
    "/razrabotka",
    "/issledovaniya",
    "/modeli",
    "/katalog",
    "/materialy",
    "/poisk",
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
    ...models.map((model) => ({
      url: new URL(`/modeli/${model.slug}`, site.url).toString(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...services.map((service) => ({
      url: new URL(`/resheniya/${service.slug}`, site.url).toString(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...aiCategories.map((category) => ({
      url: new URL(`/katalog/${category.slug}`, site.url).toString(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
