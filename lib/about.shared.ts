export const aboutDirectionSlugs = ["issledovaniya", "razrabotki", "proekty", "media"] as const;

export type AboutDirectionSlug = (typeof aboutDirectionSlugs)[number];

export interface AboutDirection {
  slug: AboutDirectionSlug;
  title: string;
  teaser: string;
  lede: string;
  body: string;
  image?: string;
}

export interface AboutLab {
  eyebrow: string;
  title: string;
  lede: string;
  slogan: string;
  body: string;
  methodTitle: string;
  methodBody: string;
  image?: string;
  contactTitle: string;
  contactLede: string;
  directions: AboutDirection[];
}

export function aboutDirectionHref(slug: AboutDirectionSlug) {
  return `/o-nas/${slug}`;
}

export function aboutParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}
