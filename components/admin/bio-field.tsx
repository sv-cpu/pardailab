"use client";

import { useState } from "react";

import { ArticleEditor } from "@/components/admin/article-editor";
import { ensureAboutHtml } from "@/lib/about.shared";

export function BioField({ initial, onChange }: { initial: string; onChange?: (html: string) => void }) {
  const [value, setValue] = useState(() => ensureAboutHtml(initial));

  return (
    <div className="grid gap-2">
      <p className="text-sm text-muted-foreground">О себе</p>
      <input type="hidden" name="bio" value={value} />
      <ArticleEditor
        initialHtml={value}
        onChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
      />
    </div>
  );
}
