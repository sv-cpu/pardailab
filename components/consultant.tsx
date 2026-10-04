"use client";

import { Waypoints } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { articleLink, recommend } from "@/lib/recommend";
import { formatScore } from "@/lib/format";
import type { CatalogSnapshot, Recommendation } from "@/lib/types";
import { cn } from "@/lib/utils";

const examples = [
  "Разобрать договор на русском",
  "Написать и проверить код",
  "Собрать иллюстрацию для статьи",
  "Автоматизировать заявки из почты",
  "Найти источники по теме",
  "Озвучить короткий ролик",
];

export function OpenConsultantButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("pardai:consultant"))}>
      {children}
    </button>
  );
}

function Toggle({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-2 text-left text-sm",
        pressed ? "border-olive bg-olive-soft text-olive" : "border-border text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Result({ result }: { result: Recommendation }) {
  return (
    <div className="mt-6 space-y-4 border-t border-border pt-5">
      <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">{result.intentLabel}</p>
      <div>
        <p className="text-xs text-muted-foreground">Модель</p>
        <Link href={`/modeli/${result.model.slug}`} className="mt-1 inline-block font-serif text-2xl hover:text-olive">
          {result.model.name}
        </Link>
        <p className="text-sm text-muted-foreground">Итог {formatScore(result.model.scores.overall)}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Сервис</p>
        <Link href={`/resheniya/${result.service.slug}`} className="mt-1 inline-block font-medium hover:text-olive">
          {result.service.name}
        </Link>
        <p className="text-sm leading-relaxed text-muted-foreground">{result.service.price}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Материал</p>
        <Link href={articleLink(result.article)} className="mt-1 inline-block text-sm leading-relaxed hover:text-olive">
          {result.article.title}
        </Link>
      </div>
      <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        {result.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}

export function Consultant({ catalog }: { catalog: CatalogSnapshot }) {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState("");
  const [budget, setBudget] = useState(false);
  const [russian, setRussian] = useState(true);
  const [needsCode, setNeedsCode] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [empty, setEmpty] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const openPanel = () => setOpen(true);
    window.addEventListener("pardai:consultant", openPanel);
    return () => window.removeEventListener("pardai:consultant", openPanel);
  }, []);

  function run(nextTask = task) {
    const recommendation = recommend(
      { task: nextTask, budgetMatters: budget, russianMatters: russian, needsCode },
      catalog,
    );
    setResult(recommendation);
    setEmpty(!recommendation);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="fixed right-4 bottom-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-olive px-5 text-sm font-medium text-accent-foreground shadow-none hover:bg-olive-deep">
        <Waypoints className="size-4" aria-hidden />
        Подобрать ИИ
      </DialogTrigger>
      <DialogContent className="right-4 bottom-24 max-h-[min(40rem,calc(100vh-8rem))] w-[min(100%-2rem,26rem)] rounded-3xl p-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          <DialogTitle className="pr-10 font-serif text-3xl tracking-tight">Подобрать ИИ</DialogTitle>
          <DialogDescription className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Опишите задачу. Мы сопоставим её с рейтингом моделей и каталогом сервисов. Это не свободный чат и не
            рекламная витрина.
          </DialogDescription>
          <label htmlFor="task" className="mt-6 block text-sm font-medium">
            Задача
          </label>
          <textarea
            id="task"
            value={task}
            onChange={(event) => setTask(event.target.value)}
            rows={3}
            placeholder="Например: подготовить письмо клиенту по пунктам договора"
            className="mt-2 w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                className="rounded-full border border-border px-3 py-1.5 text-left text-xs text-muted-foreground hover:border-olive hover:text-foreground"
                onClick={() => {
                  setTask(example);
                  run(example);
                }}
              >
                {example}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Toggle pressed={russian} onClick={() => setRussian((value) => !value)}>
              Важен русский язык
            </Toggle>
            <Toggle pressed={budget} onClick={() => setBudget((value) => !value)}>
              Важна цена
            </Toggle>
            <Toggle pressed={needsCode} onClick={() => setNeedsCode((value) => !value)}>
              Нужен код
            </Toggle>
          </div>
          <button
            type="button"
            onClick={() => run()}
            className="mt-5 h-11 rounded-full bg-olive px-5 text-sm font-medium text-accent-foreground hover:bg-olive-deep"
          >
            Показать подбор
          </button>
          {empty ? <p className="mt-4 text-sm text-muted-foreground">Опишите задачу хотя бы парой слов.</p> : null}
          {result ? <Result result={result} /> : null}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
