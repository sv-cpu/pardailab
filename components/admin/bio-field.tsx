"use client";

import { useState } from "react";

import { ArticleEditor } from "@/components/admin/article-editor";
import { ensureAboutHtml } from "@/lib/about.shared";

export function BioField({
  initial,
  onChange,
  label = "О себе",
  name = "bio",
}: {
  initial: string;
  onChange?: (html: string) => void;
  label?: string;
  name?: string;
}) {
  const [value, setValue] = useState(() => ensureAboutHtml(initial));

  return (
    <div className="grid gap-2">
      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
      <input type="hidden" name={name} value={value} />
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
