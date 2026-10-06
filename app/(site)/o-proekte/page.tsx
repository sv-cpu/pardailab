import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/container";
import { PageIntro } from "@/components/page-intro";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "О проекте",
  description:
    "PardAiLab — портал практического искусственного интеллекта. Его ведёт команда разработчиков ИИ-решений для людей и бизнеса.",
  path: "/o-proekte",
});

const parts = [
  { href: "/novosti", title: "Новости", text: "Что изменилось и что из этого следует для работы." },
  { href: "/praktika", title: "Практика", text: "Как применить инструмент к конкретной задаче." },
  { href: "/razrabotka", title: "Разработка", text: "Как встроить модель в продукт или процесс." },
  { href: "/issledovaniya", title: "Исследования", text: "Собственные проверки с темой, номером и границей выборки." },
  { href: "/modeli", title: "Модели", text: "Карточки и одна шкала сильных и слабых сторон." },
  { href: "/benchmarki", title: "Бенчмарки", text: "Выпуски шкалы. Новый не переписывает предыдущие." },
  { href: "/resheniya", title: "Каталог решений", text: "Сервисы, разложенные по задачам." },
  { href: "/katalog", title: "Каталог AI", text: "Инструменты по типу работы: текст, код, голос и остальные." },
];

export default function Page() {
  return (
    <Container className="py-16 sm:py-20">
      <PageIntro
        eyebrow="О проекте"
        title="Портал о практическом искусственном интеллекте"
        lede="PardAiLab нужен тем, кто выбирает модель, сервис или сценарий для своей работы. Портал ведёт команда разработчиков ИИ-решений для людей и бизнеса."
      />

      <div className="mt-14 max-w-2xl">
        <section>
          <h2 className="font-heading text-3xl tracking-tight">О чём портал</h2>
          <p className="mt-5 font-serif text-lg leading-8 text-pretty">
            PardAiLab — независимая лаборатория практического искусственного интеллекта. Мы публикуем новости, практические
            разборы, материалы для разработки и собственные исследования. Рядом стоят шкала моделей, выпуски бенчмарков и
            каталоги сервисов.
          </p>
          <p className="mt-5 font-serif text-lg leading-8 text-pretty">
            Портал отвечает на рабочий вопрос: подойдёт ли инструмент к задаче, где он ошибается и чего от него ждать.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-3xl tracking-tight">Зачем он нужен</h2>
          <p className="mt-5 font-serif text-lg leading-8 text-pretty">
            Человеку и компании, которые внедряют ИИ, обычно достаётся рекламный обзор или пересказ чужой новости. Первый
            хвалит. Второй не показывает границу. Академическая таблица редко совпадает с деловой задачей на русском языке:
            договором, поддержкой, внутренним процессом, кодом в живом проекте.
          </p>
          <p className="mt-5 font-serif text-lg leading-8 text-pretty">
            Мы описываем, для какой работы инструмент уместен и где его лучше не брать. Если заявление можно проверить,
            редакция проходит сценарий сама и прямо пишет, на какой выборке это сделано. Цифра в шкале — редакционная оценка
            лаборатории. Это не сертификат, не место в рекламе и не обещание, что лидер таблицы решит любую задачу.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-3xl tracking-tight">Кто это пишет</h2>
          <p className="mt-5 font-serif text-lg leading-8 text-pretty">
            Портал делает команда, которая разрабатывает ИИ-решения для людей и бизнеса. Мы проектируем и собираем системы
            для сотрудников и клиентов: документы, поддержка, процессы, продукты. Материал начинается с задачи, которую нужно
            сдать, а не с пресс-релиза, который нужно разослать.
          </p>
          <p className="mt-5 font-serif text-lg leading-8 text-pretty">
            Та же команда делает{" "}
            <a
              href="https://tech-victory.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-border underline-offset-4 hover:decoration-olive"
            >
              tech-victory.ru
            </a>{" "}
            — портал о беспилотниках, робототехнике и смежных технологиях.
          </p>
          <p className="mt-5 font-serif text-lg leading-8 text-pretty">
            Мы не выпускаем собственные модели и не продаём позицию в каталоге или в шкале. Сравнение существует, чтобы его
            можно было прочитать и оспорить по делу.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-3xl tracking-tight">Как устроен портал</h2>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {parts.map((item) => (
              <li key={item.href} className="py-4">
                <Link href={item.href} className="font-heading text-2xl tracking-tight hover:text-olive">
                  {item.title}
                </Link>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 font-serif text-lg leading-8 text-pretty">
            Соглашаться с оценкой не обязательно. Важно видеть, на чём она стоит, и решать по своей работе.
          </p>
        </section>
      </div>
    </Container>
  );
}
