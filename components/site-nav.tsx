"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";

function Item({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={cn(
        "border-b border-transparent py-1 text-sm text-muted-foreground hover:text-foreground",
        active && "border-olive text-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (detailsRef.current) detailsRef.current.open = false;
  }, [pathname]);

  return (
    <>
      <nav className="hidden items-center gap-4 xl:flex" aria-label="Разделы">
        {nav.map((item) => (
          <Item key={item.href} {...item} pathname={pathname} />
        ))}
      </nav>
      <details ref={detailsRef} className="relative xl:hidden">
        <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-border px-4 text-sm">
          <Menu className="size-4" aria-hidden />
          Меню
        </summary>
        <nav
          className="absolute right-0 z-40 mt-2 flex w-64 flex-col gap-1 rounded-2xl border border-border bg-background p-3"
          aria-label="Разделы"
        >
          {nav.map((item) => (
            <Item key={item.href} {...item} pathname={pathname} />
          ))}
        </nav>
      </details>
    </>
  );
}
