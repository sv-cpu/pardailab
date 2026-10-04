"use client";

import { useState } from "react";

import type { RubricRecord } from "@/lib/rubric-seed";

import { fieldClass } from "./ui";

export function RubricFields({
  rubrics,
  rubric,
  subrubric,
}: {
  rubrics: RubricRecord[];
  rubric?: string;
  subrubric?: string;
}) {
  const parents = rubrics.filter((item) => !item.parent);
  const [parent, setParent] = useState(rubric || "");
  const children = rubrics.filter((item) => item.parent === parent);
  return (
    <>
      <label className="grid gap-2 text-sm">
        <span className="text-muted-foreground">Рубрика</span>
        <select
          name="rubric"
          value={parent}
          className={fieldClass}
          onChange={(event) => setParent(event.target.value)}
        >
          <option value="">Выберите рубрику</option>
          {parents.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        <span className="text-muted-foreground">Подрубрика</span>
        <select name="subrubric" key={parent} defaultValue={children.some((item) => item.slug === subrubric) ? subrubric : ""} className={fieldClass}>
          <option value="">Без подрубрики</option>
          {children.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
