"use client";

import { ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import type { MenuRubric } from "@/lib/rubrics";
import { cn } from "@/lib/utils";

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

function RubricItem({ item, pathname }: { item: MenuRubric; pathname: string }) {
  if (!item.children.length) return <Item href={item.href} label={item.name} pathname={pathname} />;
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <div className="group relative">
      <Link
        href={item.href}
        className={cn(
          "inline-flex items-center gap-1 border-b border-transparent py-1 text-sm hover:text-foreground",
          active || pathname.startsWith(`${item.href}/`) ? "border-olive text-foreground" : "text-muted-foreground",
        )}
      >
        {item.name}
        <ChevronDown className="size-3.5" aria-hidden />
      </Link>
      <div className="invisible absolute top-full left-0 z-40 pt-3 group-hover:visible group-focus-within:visible">
        <div className="flex w-56 flex-col gap-2 border border-border bg-background p-3">
          {item.children.map((child) => (
            <Link key={child.slug} href={child.href} className="text-sm text-muted-foreground hover:text-foreground">
              {child.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SiteNav({ rubrics }: { rubrics: MenuRubric[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden min-w-0 flex-1 items-center gap-5 lg:flex" aria-label="Разделы">
      {rubrics.map((item) => (
        <RubricItem key={item.slug} item={item} pathname={pathname} />
      ))}
      <Item href="/benchmarki" label="Бенчмарки" pathname={pathname} />
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
    <details ref={menuRef} className="relative lg:hidden">
      <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-border px-4 text-sm">
        <Menu className="size-4" aria-hidden />
        Меню
      </summary>
      <div className="absolute right-0 z-40 mt-2 flex w-64 flex-col gap-3 rounded-2xl border border-border bg-background p-3">
        <nav className="flex flex-col gap-2" aria-label="Разделы">
          <Item href="/benchmarki" label="Бенчмарки" pathname={pathname} />
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
      </div>
    </details>
  );
}
