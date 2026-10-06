"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { Highlight } from "@/components/search-hits";
import { searchRecords, type SearchRecord } from "@/lib/search";
import { cn } from "@/lib/utils";

export function SiteSearch({ records }: { records: SearchRecord[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const listId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pinnedQuery, setPinnedQuery] = useState("");
  const [active, setActive] = useState(0);
  const [path, setPath] = useState(pathname);

  if (query !== pinnedQuery) {
    setPinnedQuery(query);
    setActive(0);
  }
  if (path !== pathname) {
    setPath(pathname);
    setOpen(false);
  }

  const hits = open ? searchRecords(query, records, 8) : [];
  const selected = hits.length ? Math.min(active, hits.length - 1) : 0;
  const trimmed = query.trim();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!open) return;
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (typing || event.repeat) return;
      const command = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const slash = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
      if (command || slash) {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function close(restore = true) {
    setOpen(false);
    if (restore) buttonRef.current?.focus();
  }

  function openHit(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function trapFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const items = [...panel.querySelectorAll<HTMLElement>("a, button, input")].filter((item) => item.tabIndex >= 0);
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, Math.max(hits.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      const hit = hits[selected];
      if (!hit) return;
      event.preventDefault();
      openHit(hit.href);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="flex size-11 items-center justify-center rounded-full border border-border hover:border-olive"
        aria-label="Поиск"
        aria-expanded={open}
        aria-keyshortcuts="/ Control+K Meta+K"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" aria-hidden />
      </button>
      {open ? (
        <div ref={panelRef} className="fixed inset-0 z-50" onKeyDown={trapFocus}>
          <button type="button" tabIndex={-1} className="absolute inset-0 bg-foreground/40" aria-label="Закрыть поиск" onClick={() => close()} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Поиск"
            className="relative mx-auto mt-20 w-[min(36rem,calc(100%-2rem))] overflow-hidden rounded-2xl border border-border bg-background"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="size-5 shrink-0 text-olive" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKeyDown}
                role="combobox"
                aria-expanded={open}
                aria-controls={hits.length ? listId : undefined}
                aria-autocomplete="list"
                aria-activedescendant={hits.length ? `${listId}-${selected}` : undefined}
                placeholder="Слова, которые помните"
                className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
            </div>
            {trimmed ? (
              hits.length ? (
                <>
                  <ul id={listId} role="listbox" className="max-h-[min(24rem,60vh)] overflow-auto p-2">
                    {hits.map((hit, index) => (
                      <li key={hit.href} role="presentation">
                        <Link
                          id={`${listId}-${index}`}
                          href={hit.href}
                          role="option"
                          aria-selected={index === selected}
                          className={cn("block rounded-xl px-3 py-3", index === selected && "bg-olive-soft")}
                          onMouseEnter={() => setActive(index)}
                          onClick={() => close(false)}
                        >
                          <p className="font-mono text-[11px] tracking-[0.14em] text-olive uppercase">{hit.kind}</p>
                          <p className="mt-1 font-heading text-lg leading-snug">
                            <Highlight text={hit.title} query={query} />
                          </p>
                          {hit.snippet ? (
                            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                              <Highlight text={hit.snippet} query={query} />
                            </p>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-border px-4 py-3 text-sm">
                    <Link
                      href={`/poisk?q=${encodeURIComponent(trimmed)}`}
                      className="text-olive hover:text-olive-deep"
                      onClick={() => close(false)}
                    >
                      Показать все
                    </Link>
                  </div>
                </>
              ) : (
                <p className="px-4 py-6 text-sm text-muted-foreground">По запросу «{trimmed}» ничего не нашлось.</p>
              )
            ) : (
              <p className="px-4 py-6 text-sm text-muted-foreground">Наберите слова, которые помните</p>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
