import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

export function SearchForm({
  defaultValue = "",
  large = false,
}: {
  defaultValue?: string;
  large?: boolean;
}) {
  return (
    <form action="/poisk" method="get" role="search" className="w-full">
      <label htmlFor="q" className="sr-only">
        Поиск по статьям, сервисам, моделям и исследованиям
      </label>
      <div
        className={cn(
          "flex items-center gap-3 rounded-full border border-border bg-card px-4",
          large ? "h-16" : "h-12",
        )}
      >
        <Search className="size-5 shrink-0 text-olive" aria-hidden />
        <input
          id="q"
          name="q"
          defaultValue={defaultValue}
          placeholder="Статьи, сервисы, модели"
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground",
            large ? "text-lg" : "text-base",
          )}
        />
        <button
          type="submit"
          className="h-10 shrink-0 rounded-full bg-olive px-4 text-sm font-medium text-accent-foreground hover:bg-olive-deep"
        >
          Найти
        </button>
      </div>
    </form>
  );
}
