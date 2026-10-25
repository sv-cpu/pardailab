import { renderAboutHtml } from "@/lib/about";

export function AboutCopy({ text, className }: { text: string; className?: string }) {
  const html = renderAboutHtml(text);
  if (!html) return null;
  return <div className={["article-html", className].filter(Boolean).join(" ")} dangerouslySetInnerHTML={{ __html: html }} />;
}
