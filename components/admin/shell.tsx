import Link from "next/link";

import { logout } from "@/app/admin/actions";
import { Mark } from "@/components/site-header";

const links = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/articles", label: "Статьи" },
  { href: "/admin/services", label: "Сервисы" },
  { href: "/admin/models", label: "Модели" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="h-1 bg-olive" />
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 sm:px-8">
          <Link href="/admin" className="flex items-center gap-2 text-olive">
            <Mark className="size-7" />
            <span className="font-heading text-lg text-foreground">Редакция</span>
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-olive">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <Link href="/" className="hover:text-olive">
              На сайт
            </Link>
            <form action={logout}>
              <button type="submit" className="hover:text-olive">
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}
