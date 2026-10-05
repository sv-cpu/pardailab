"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { StaffRole } from "@/lib/users";

const links = [
  { href: "/admin", label: "Обзор", editor: false },
  { href: "/admin/articles", label: "Статьи", editor: false },
  { href: "/admin/profile", label: "Профиль", editor: false },
  { href: "/admin/rubrics", label: "Рубрики", editor: true },
  { href: "/admin/services", label: "Сервисы", editor: true },
  { href: "/admin/models", label: "Модели", editor: true },
  { href: "/admin/users", label: "Пользователи", editor: true },
];

export function AdminNav({ role, onNavigate }: { role: StaffRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Редакция">
      {links.filter((link) => role === "editor" || !link.editor).map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "px-3 py-2 text-sm",
              active ? "bg-olive-soft text-foreground" : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
