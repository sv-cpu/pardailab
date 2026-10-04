"use client";

import { ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { library, sections } from "@/lib/site";
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

export function SiteNav() {
  const pathname = usePathname();
  const moreRef = useRef<HTMLDetailsElement>(null);
  const libraryActive = library.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  useEffect(() => {
    if (moreRef.current) moreRef.current.open = false;
  }, [pathname]);

  return (
    <nav className="hidden min-w-0 flex-1 items-center gap-5 lg:flex" aria-label="Разделы">
      {sections.map((item) => (
        <Item key={item.href} {...item} pathname={pathname} />
      ))}
      <details ref={moreRef} className="relative">
        <summary
          className={cn(
            "flex cursor-pointer list-none items-center gap-1 border-b border-transparent py-1 text-sm hover:text-foreground",
            libraryActive ? "border-olive text-foreground" : "text-muted-foreground",
          )}
        >
          Ещё
          <ChevronDown className="size-3.5" aria-hidden />
        </summary>
        <div className="absolute left-0 z-40 mt-3 flex w-56 flex-col gap-2 rounded-2xl border border-border bg-background p-3">
          {library.map((item) => (
            <Item key={item.href} {...item} pathname={pathname} className="border-b-0 py-1" />
          ))}
        </div>
      </details>
    </nav>
  );
}

export function SiteMenu() {
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
        <nav className="flex flex-col gap-1" aria-label="Разделы">
          {sections.map((item) => (
            <Item key={item.href} {...item} pathname={pathname} />
          ))}
        </nav>
        <nav className="flex flex-col gap-1 border-t border-border pt-3" aria-label="Каталоги">
          {library.map((item) => (
            <Item key={item.href} {...item} pathname={pathname} />
          ))}
        </nav>
      </div>
    </details>
  );
}
