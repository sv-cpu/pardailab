import Link from "next/link";

import { contentCounts } from "@/lib/db";
import { inquiryCounts } from "@/lib/inquiries";

export default function OverviewPage() {
  const counts = contentCounts();
  const inquiries = inquiryCounts();
  const cards = [
    { href: "/admin/articles", label: "Статьи", total: counts.articles, note: "" },
    { href: "/admin/services", label: "Сервисы", total: counts.services, note: "" },
    { href: "/admin/models", label: "Модели", total: counts.models, note: "" },
    { href: "/admin/inquiries", label: "Обращения", total: inquiries.total, note: inquiries.fresh ? `${inquiries.fresh} новых` : "" },
  ];
  return (
    <div>
      <h1 className="font-heading text-4xl tracking-tight">Обзор</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Правки попадают на сайт сразу после сохранения. Архив хранится в базе редакции.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <li key={card.href}>
            <Link href={card.href} className="block rounded-2xl border border-border bg-card px-5 py-6 hover:border-olive">
              <p className="font-mono text-3xl text-olive">{card.total}</p>
              <p className="mt-2 font-heading text-2xl">{card.label}</p>
              {card.note ? <p className="mt-1 text-sm text-olive">{card.note}</p> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
