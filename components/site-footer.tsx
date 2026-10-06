import Link from "next/link";

import { OpenConsultantButton } from "@/components/consultant";
import { Container } from "@/components/container";
import { ratingStamp } from "@/lib/rating";
import { ratingPeriod } from "@/lib/rating-view";
import { menuRubrics } from "@/lib/rubrics";
import { library } from "@/lib/site";

export function SiteFooter() {
  const sections = menuRubrics();
  const rating = ratingStamp();
  return (
    <footer className="mt-8 border-t border-border pb-28">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-heading text-2xl tracking-tight">PardAiLab</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Независимая лаборатория практического искусственного интеллекта. Мы объясняем инструменты и публикуем
            собственные проверки, а не пересказываем ленту.
          </p>
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">Разделы</p>
          <ul className="mt-4 space-y-2 text-sm">
            {sections.map((item) => (
              <li key={item.slug}>
                <Link href={item.href} className="underline decoration-border underline-offset-4 hover:decoration-olive">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">Справочник</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/benchmarki" className="underline decoration-border underline-offset-4 hover:decoration-olive">
                Бенчмарки
              </Link>
            </li>
            <li>
              <Link href="/materialy" className="underline decoration-border underline-offset-4 hover:decoration-olive">
                Все материалы
              </Link>
            </li>
            {library.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="underline decoration-border underline-offset-4 hover:decoration-olive">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/poisk" className="underline decoration-border underline-offset-4 hover:decoration-olive">
                Поиск
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">Подбор</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Опишите задачу. Лаборатория предложит модель, сервис и материал. Место в подборе не продаётся.
          </p>
          <OpenConsultantButton className="mt-4 inline-flex h-11 items-center rounded-full bg-olive px-5 text-sm font-medium text-accent-foreground hover:bg-olive-deep">
            Подобрать ИИ
          </OpenConsultantButton>
        </div>
      </Container>
      <Container className="border-t border-border py-6 text-sm text-muted-foreground">
        <p>
          Оценки — редакционная шкала лаборатории, {ratingPeriod(rating.updated).toLowerCase()}. Это не реклама вендоров и не академическая
          сертификация.
        </p>
        <p className="mt-2">© {new Date().getFullYear()} PardAiLab</p>
      </Container>
    </footer>
  );
}
