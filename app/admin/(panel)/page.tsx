import Link from "next/link";

import { contentCounts } from "@/lib/db";

export default function OverviewPage() {
  const counts = contentCounts();
  const cards = [
    { href: "/admin/articles", label: "Статьи", total: counts.articles },
    { href: "/admin/services", label: "Сервисы", total: counts.services },
    { href: "/admin/models", label: "Модели", total: counts.models },
  ];
  return (
    <div>
      <h1 className="font-serif text-4xl tracking-tight">Обзор</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Правки попадают на сайт сразу после сохранения. Архив хранится в базе редакции.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <li key={card.href}>
            <Link href={card.href} className="block rounded-2xl border border-border bg-card px-5 py-6 hover:border-olive">
              <p className="font-mono text-3xl text-olive">{card.total}</p>
              <p className="mt-2 font-serif text-2xl">{card.label}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
