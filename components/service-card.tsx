import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { formatScore } from "@/lib/format";
import type { Service } from "@/lib/types";

export function ServiceCard({ service, similar }: { service: Service; similar: Service[] }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="flex size-14 items-center justify-center rounded-2xl border border-border bg-background font-mono text-sm text-olive"
          >
            {service.mark}
          </span>
          <div>
            <h2 className="font-serif text-3xl tracking-tight">
              <Link href={`/resheniya/${service.slug}`} className="hover:text-olive">
                {service.name}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Знак каталога, не официальный логотип</p>
          </div>
        </div>
        <p className="font-mono text-sm text-olive">
          <span className="text-muted-foreground">Рейтинг </span>
          {formatScore(service.rating)}
        </p>
      </div>
      <p className="mt-5 max-w-3xl leading-relaxed text-pretty">{service.description}</p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        <span className="text-foreground">Стоимость. </span>
        {service.price}
      </p>
      <p className="mt-3 text-sm">
        <span className="text-muted-foreground">Область. </span>
        {service.domains.join(" · ")}
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">Плюсы</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed">
            {service.pros.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Минусы</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            {service.cons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <a
          href={service.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 underline decoration-border underline-offset-4 hover:decoration-olive"
        >
          Официальный сайт
          <ArrowUpRight className="size-4" aria-hidden />
        </a>
        {similar.length ? (
          <p>
            <span className="text-muted-foreground">Похожие. </span>
            {similar.map((item, index) => (
              <span key={item.slug}>
                {index > 0 ? ", " : null}
                <Link href={`/resheniya/${item.slug}`} className="underline decoration-border underline-offset-4 hover:decoration-olive">
                  {item.name}
                </Link>
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </article>
  );
}
