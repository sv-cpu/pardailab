import { ensureAboutHtml } from "@/lib/about.shared";
import { sanitizeArticleHtml } from "@/lib/html";

const BIO_MAX = 50_000;

/** Plain text becomes paragraphs. HTML is kept, then the same article sanitizer runs. */
export function cleanStaffBio(source: string) {
  const raw = source.replace(/\0/g, "").slice(0, BIO_MAX);
  const html = sanitizeArticleHtml(ensureAboutHtml(raw)).trim();
  if (!html.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim()) return "";
  return html;
}

/** Visible text for the author page description. Tags stay out of search snippets. */
export function bioPlainText(source: string, max = 200) {
  const text = cleanStaffBio(source)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  const base = (space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd();
  return `${base}…`;
}
