"use client";

import { ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { MenuRubric } from "@/lib/rubrics";
import { cn } from "@/lib/utils";

const reference = [
  { href: "/modeli", label: "Модели", menu: "Модели" },
  { href: "/resheniya", label: "Решения", menu: "Каталог решений" },
  { href: "/katalog", label: "Каталог", menu: "Каталог AI" },
  { href: "/benchmarki", label: "Бенчмарки", menu: "Бенчмарки" },
];

function Item({
  href,
  label,
  pathname,
  className,
}: {
  href: string;
  label: string;
  pathname: string;
  className?: string;
}) {
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={cn(
        "border-b border-transparent py-1 text-sm hover:text-foreground",
        active ? "border-olive text-foreground" : "text-muted-foreground",
        className,
      )}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

function RubricItem({
  item,
  pathname,
  open,
  onToggle,
}: {
  item: MenuRubric;
  pathname: string;
  open: boolean;
  onToggle: (slug: string) => void;
}) {
  if (!item.children.length) return <Item href={item.href} label={item.name} pathname={pathname} />;
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const panelId = `rubric-${item.slug}`;
  return (
    <div className="relative">
      <span className="inline-flex items-center">
        <Link
          href={item.href}
          className={cn(
            "border-b border-transparent py-1 text-sm hover:text-foreground",
            active ? "border-olive text-foreground" : "text-muted-foreground",
          )}
          aria-current={active ? "page" : undefined}
        >
          {item.name}
        </Link>
        <button
          type="button"
          className={cn("px-1 py-1 text-muted-foreground hover:text-foreground", active && "text-foreground")}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`Подрубрики: ${item.name}`}
          onClick={() => onToggle(item.slug)}
        >
          <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      </span>
      {open ? (
        <div id={panelId} className="absolute top-full left-0 z-40 pt-3">
          <div className="flex w-56 flex-col gap-2 border border-border bg-background p-3">
            {item.children.map((child) => (
              <Link key={child.slug} href={child.href} className="text-sm text-muted-foreground hover:text-foreground">
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SiteNav({ rubrics }: { rubrics: MenuRubric[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [path, setPath] = useState(pathname);
  const navRef = useRef<HTMLElement>(null);
  if (path !== pathname) {
    setPath(pathname);
    setOpen(null);
  }

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) setOpen(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <nav ref={navRef} className="hidden min-w-0 flex-1 items-center gap-x-3 xl:gap-x-4 lg:flex" aria-label="Разделы">
      {rubrics.map((item) => (
        <RubricItem
          key={item.slug}
          item={item}
          pathname={pathname}
          open={open === item.slug}
          onToggle={(slug) => setOpen((current) => (current === slug ? null : slug))}
        />
      ))}
      <span className="mx-1 hidden h-4 w-px shrink-0 bg-border lg:block" aria-hidden />
      {reference.map((item) => (
        <Item key={item.href} href={item.href} label={item.label} pathname={pathname} />
      ))}
    </nav>
  );
}

export function SiteMenu({ rubrics }: { rubrics: MenuRubric[] }) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (menuRef.current) menuRef.current.open = false;
  }, [pathname]);

  return (
    <details ref={menuRef} className="lg:hidden">
      <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-border px-4 text-sm">
        <Menu className="size-4" aria-hidden />
        Меню
      </summary>
      <div className="fixed top-[4.75rem] right-5 left-5 z-40 flex max-h-[min(70vh,calc(100dvh-6rem))] flex-col gap-4 overflow-y-auto rounded-2xl border border-border bg-background p-4 sm:right-8 sm:left-auto sm:w-80">
        <nav className="flex flex-col gap-2" aria-label="Разделы">
          {rubrics.map((item) => (
            <div key={item.slug}>
              <Item href={item.href} label={item.name} pathname={pathname} />
              {item.children.length ? (
                <div className="mt-1 ml-3 flex flex-col gap-1">
                  {item.children.map((child) => (
                    <Link key={child.slug} href={child.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        <nav className="flex flex-col gap-2 border-t border-border pt-3" aria-label="Справочник">
          <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">Справочник</p>
          {reference.map((item) => (
            <Item key={item.href} href={item.href} label={item.menu} pathname={pathname} />
          ))}
        </nav>
      </div>
    </details>
  );
}
