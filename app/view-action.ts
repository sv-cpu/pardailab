"use server";

import { recordArticleView } from "@/lib/article-views";

export async function recordArticleViewAction(slug: string) {
  if (!slug || slug.length > 200) return;
  recordArticleView(slug);
}
