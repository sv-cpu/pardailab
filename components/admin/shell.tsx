"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { logout } from "@/app/admin/actions";
import { Mark } from "@/components/mark";

import type { StaffRole } from "@/lib/users";

import { AdminNav } from "./nav";

export function AdminShell({ role, children }: { role: StaffRole; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
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
      </aside>
      <main className="mx-auto w-full min-w-0 max-w-6xl overflow-x-hidden px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
