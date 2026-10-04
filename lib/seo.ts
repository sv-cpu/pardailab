import type { Metadata } from "next";

import { formatDate } from "@/lib/format";
import { articleHref } from "@/lib/paths";
import { site } from "@/lib/site";
import type { Article } from "@/lib/types";

export function pageMeta({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = new URL(path, site.url).toString();
  const fullTitle = `${title} — ${site.name}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: site.name,
      locale: "ru_RU",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export function articleMeta(article: Article): Metadata {
  const path = articleHref(article.kind, article.slug);
  const meta = pageMeta({ title: article.title, description: article.description, path });
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
    },
  };
}

export function articleJsonLd(article: Article) {
  const url = new URL(articleHref(article.kind, article.slug), site.url).toString();
  const type = article.kind === "research" ? "Report" : article.kind === "news" ? "NewsArticle" : "TechArticle";
  return {
    "@context": "https://schema.org",
    "@type": type,
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: "ru",
    author: { "@type": "Organization", name: article.author, url: site.url },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: { "@type": "ImageObject", url: new URL("/icon", site.url).toString() },
    },
    mainEntityOfPage: url,
    timeRequired: `PT${article.readingMinutes}M`,
    articleSection: article.category,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, site.url).toString(),
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: site.name,
        url: site.url,
        description: site.description,
        logo: new URL("/icon", site.url).toString(),
      },
      {
        "@type": "WebSite",
        name: site.name,
        url: site.url,
        inLanguage: "ru",
        description: site.description,
        publisher: { "@type": "Organization", name: site.name },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${site.url}/poisk?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function datedLabel(article: Article) {
  return formatDate(article.date);
}
