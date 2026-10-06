"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logout } from "@/app/admin/actions";
import { Mark } from "@/components/mark";
import { cn } from "@/lib/utils";

import type { StaffRole } from "@/lib/users";

import { AdminNav } from "./nav";

function initialOf(value: string) {
  const letter = value.trim().slice(0, 1);
  return letter ? letter.toLocaleUpperCase("ru-RU") : "?";
}

export function AdminShell({
  role,
  account,
  children,
}: {
  role: StaffRole;
  account: { name: string; roleLabel: string; photo?: string };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const profileActive = pathname === "/admin/profile" || pathname.startsWith("/admin/profile/");
  return (
    <div className="min-h-screen lg:pl-60">
      <aside className="border-b border-border bg-card lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-b-0">
        <div className="h-1 bg-olive" />
        <div className="flex items-center gap-3 px-5 py-4">
          <Link href="/admin" className="flex items-center gap-2 text-olive">
            <Mark className="size-7" />
            <span className="font-heading text-lg text-foreground">Редакция</span>
          </Link>
          <button
            type="button"
            className="ml-auto flex size-10 items-center justify-center border border-border lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
        <div className={open ? "block" : "hidden lg:flex lg:flex-1 lg:flex-col"}>
          <div className="px-3 pb-4 lg:flex-1">
            <AdminNav role={role} onNavigate={() => setOpen(false)} />
          </div>
          <div className="border-t border-border">
            <Link
              href="/admin/profile"
              onClick={() => setOpen(false)}
              aria-current={profileActive ? "page" : undefined}
              className={cn("flex items-center gap-3 px-5 py-4", profileActive ? "bg-olive-soft" : "hover:bg-background")}
            >
              <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-olive-soft text-olive">
                {account.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={account.photo} alt="" className="size-full object-cover" />
                ) : (
                  <span className="font-heading text-lg">{initialOf(account.name)}</span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-foreground">{account.name}</span>
                <span className="block text-xs text-muted-foreground">{account.roleLabel} · профиль</span>
              </span>
            </Link>
            <div className="flex items-center gap-4 border-t border-border px-5 py-4 text-sm">
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
        </div>
      </aside>
      <main className="mx-auto w-full min-w-0 max-w-6xl overflow-x-hidden px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
