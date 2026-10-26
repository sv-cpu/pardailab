"use client";

import { useEffect } from "react";

import { recordArticleViewAction } from "@/app/view-action";

export function ArticleView({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `article-view:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Браузер без хранилища вкладки всё равно считает это открытие.
    }
    void recordArticleViewAction(slug);
  }, [slug]);
  return null;
}
