import { Search } from "lucide-react";
import Link from "next/link";

import { SiteNav } from "@/components/site-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 22.5V9.5h7.6c2.9 0 4.7 1.7 4.7 4.15 0 2.46-1.8 4.15-4.7 4.15H9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="23.2" cy="22.2" r="1.35" fill="currentColor" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="h-1 bg-olive" />
      <div className="mx-auto flex h-[4.25rem] w-full max-w-6xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-olive">
          <Mark className="size-8" />
          <span className="font-serif text-xl tracking-tight text-foreground">
            PardAi<span className="text-olive">Labs</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <SiteNav />
          <Link
            href="/poisk"
            className="flex size-11 items-center justify-center rounded-full border border-border hover:border-olive"
            aria-label="Поиск"
          >
            <Search className="size-4" aria-hidden />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
