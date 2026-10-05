"use client";

import type { RubricRecord } from "@/lib/rubric-seed";

import { fieldClass } from "./ui";

export function RubricFields({
  rubrics,
  rubric,
  subrubric,
  onRubric,
  onSubrubric,
}: {
  rubrics: RubricRecord[];
  rubric: string;
  subrubric: string;
  onRubric: (slug: string) => void;
  onSubrubric: (slug: string) => void;
}) {
  const parents = rubrics.filter((item) => !item.parent);
  const children = rubrics.filter((item) => item.parent === rubric);
  const child = children.some((item) => item.slug === subrubric) ? subrubric : "";
  return (
    <>
      <label className="grid gap-2 text-sm">
        <span className="text-muted-foreground">Рубрика</span>
        <select
          name="rubric"
          value={rubric}
          className={fieldClass}
          onChange={(event) => {
            onRubric(event.target.value);
            onSubrubric("");
          }}
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
        <select name="subrubric" value={child} className={fieldClass} onChange={(event) => onSubrubric(event.target.value)}>
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
