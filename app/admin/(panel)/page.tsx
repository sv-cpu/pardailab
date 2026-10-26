import Link from "next/link";

import { articleViewStats, viewCountLabel } from "@/lib/article-views";
import { contentCounts, listArticles } from "@/lib/db";
import { inquiryCounts } from "@/lib/inquiries";
import { articleHref, kindLabel } from "@/lib/paths";

export default function OverviewPage() {
  const counts = contentCounts();
  const inquiries = inquiryCounts();
  const views = articleViewStats(listArticles());
  const cards = [
    { href: "/admin/articles", label: "Статьи", total: counts.articles, note: "" },
    { href: "/admin/about", label: "О нас", total: 5, note: "хаб и 4 направления" },
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
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li>
          <div className="rounded-2xl border border-border bg-card px-5 py-6">
            <p className="font-mono text-3xl text-olive">{views.total.toLocaleString("ru-RU")}</p>
            <p className="mt-2 font-heading text-2xl">Просмотры</p>
            <p className="mt-1 text-sm text-muted-foreground">за всё время</p>
          </div>
        </li>
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
      <section className="mt-12">
        <h2 className="font-heading text-3xl tracking-tight">Самые читаемые</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          {viewCountLabel(views.total)}. Повторное открытие в той же вкладке браузера не считается снова.
        </p>
        {views.top.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-normal">#</th>
                  <th className="py-2 pr-4 font-normal">Статья</th>
                  <th className="py-2 pr-4 font-normal">Раздел</th>
                  <th className="py-2 text-right font-normal">Просмотры</th>
                </tr>
              </thead>
              <tbody>
                {views.top.map((article, index) => (
                  <tr key={article.slug} className="border-b border-border">
                    <td className="py-3 pr-3 text-muted-foreground">{index + 1}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/admin/articles/${article.slug}`} className="hover:text-olive">
                        {article.title}
                      </Link>
                      <Link href={articleHref(article.kind, article.slug)} className="mt-1 block text-xs text-muted-foreground hover:text-olive">
                        На сайте
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{kindLabel[article.kind]}</td>
                    <td className="py-3 text-right font-mono">{article.views.toLocaleString("ru-RU")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">Пока ни одну статью не открывали.</p>
        )}
      </section>
    </div>
  );
}
