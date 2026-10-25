export const aboutDirectionSlugs = ["issledovaniya", "razrabotki", "proekty", "media"] as const;

export type AboutDirectionSlug = (typeof aboutDirectionSlugs)[number];

export interface AboutProject {
  id: string;
  title: string;
  description: string;
  cover: string;
  /** Optional external or site link. */
  url?: string;
}

export interface AboutDevelopment {
  id: string;
  title: string;
  /** Short text shown on the card. */
  summary: string;
  /** Full HTML shown in the modal. */
  body: string;
  cover: string;
}

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
  projects: AboutProject[];
  developments: AboutDevelopment[];
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

export function escapeAboutText(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/** Plain paragraphs → HTML for the editor; already-marked HTML is left as-is. */
export function ensureAboutHtml(source: string) {
  const trimmed = source.replace(/\r\n/g, "\n").trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  return aboutParagraphs(trimmed)
    .map((part) => `<p>${escapeAboutText(part)}</p>`)
    .join("\n");
}
