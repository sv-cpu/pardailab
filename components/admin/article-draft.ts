export type ArticleDraft = {
  title: string;
  slug: string;
  slugTouched: boolean;
  description: string;
  rubric: string;
  subrubric: string;
  rubric2: string;
  subrubric2: string;
  date: string;
  tags: string;
  bodyHtml: string;
  savedAt: number;
};

function key(slug: string) {
  return `pardai-article-draft:${slug || "new"}`;
}

export function readDraft(slug: string): ArticleDraft | null {
  try {
    const raw = sessionStorage.getItem(key(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ArticleDraft>;
    if (typeof parsed.title !== "string" || typeof parsed.bodyHtml !== "string") return null;
    return {
      title: parsed.title,
      slug: typeof parsed.slug === "string" ? parsed.slug : "",
      slugTouched: Boolean(parsed.slugTouched),
      description: typeof parsed.description === "string" ? parsed.description : "",
      rubric: typeof parsed.rubric === "string" ? parsed.rubric : "",
      subrubric: typeof parsed.subrubric === "string" ? parsed.subrubric : "",
      rubric2: typeof parsed.rubric2 === "string" ? parsed.rubric2 : "",
      subrubric2: typeof parsed.subrubric2 === "string" ? parsed.subrubric2 : "",
      date: typeof parsed.date === "string" ? parsed.date : "",
      tags: typeof parsed.tags === "string" ? parsed.tags : "",
      bodyHtml: parsed.bodyHtml,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function writeDraft(slug: string, draft: ArticleDraft) {
  try {
    sessionStorage.setItem(key(slug), JSON.stringify(draft));
  } catch {
    // The form itself still holds the text if the browser refuses storage.
  }
}

export function clearDraft(slug: string) {
  try {
    sessionStorage.removeItem(key(slug));
  } catch {
    // Ignore a locked storage: the page is leaving or the draft was never stored.
  }
}
