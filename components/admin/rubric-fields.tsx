"use client";

import type { RubricRecord } from "@/lib/rubric-seed";

import { fieldClass } from "./ui";

export function RubricFields({
  rubrics,
  rubric,
  subrubric,
  onRubric,
  onSubrubric,
  heading,
  hint,
  rubricName = "rubric",
  subName = "subrubric",
  emptyRubric = "Выберите рубрику",
}: {
  rubrics: RubricRecord[];
  rubric: string;
  subrubric: string;
  onRubric: (slug: string) => void;
  onSubrubric: (slug: string) => void;
  heading?: string;
  hint?: string;
  rubricName?: string;
  subName?: string;
  emptyRubric?: string;
}) {
  const parents = rubrics.filter((item) => !item.parent);
  const children = rubrics.filter((item) => item.parent === rubric);
  const child = children.some((item) => item.slug === subrubric) ? subrubric : "";
  return (
    <div className="grid gap-5">
      {heading ? <p className="text-sm text-foreground">{heading}</p> : null}
      <label className="grid gap-2 text-sm">
        <span className="text-muted-foreground">Рубрика</span>
        <select
          name={rubricName}
          value={rubric}
          className={fieldClass}
          onChange={(event) => {
            onRubric(event.target.value);
            onSubrubric("");
          }}
        >
          <option value="">{emptyRubric}</option>
          {parents.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        <span className="text-muted-foreground">Подрубрика</span>
        <select name={subName} value={child} className={fieldClass} onChange={(event) => onSubrubric(event.target.value)}>
          <option value="">Без подрубрики</option>
          {children.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
