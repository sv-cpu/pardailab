import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Container } from "@/components/container";
import type { LabProject } from "@/lib/lab-projects";
import { aboutDirectionHref } from "@/lib/about.shared";

export function LabProjectView({ project }: { project: LabProject }) {
  return (
    <Container className="py-16 sm:py-20">
      <Breadcrumbs
        items={[
          { href: "/", label: "Главная" },
          { href: "/o-nas", label: "О нас" },
          { href: aboutDirectionHref("proekty"), label: "Проекты" },
          { label: project.title },
        ]}
      />

      <header className="mt-8 max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.18em] text-olive uppercase">Проект лаборатории</p>
        <h1 className="mt-4 font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {project.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">{project.lede}</p>
        <p className="mt-4 font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">{project.revision}</p>
      </header>

      <div className="relative mt-10 aspect-[16/9] max-w-5xl overflow-hidden bg-[#f4f2ec] sm:mt-12">
        <Image
          src={project.cover}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 1024px, 100vw"
          unoptimized
          className="object-cover lab-project-reveal"
        />
      </div>

      <ul className="mt-10 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {project.facts.map((fact, index) => (
          <li
            key={fact.label}
            className="bg-background px-5 py-5 sm:px-6 lab-project-reveal"
            style={{ animationDelay: `${120 + index * 60}ms` }}
          >
            <p className="font-heading text-2xl tracking-tight sm:text-3xl">{fact.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{fact.label}</p>
          </li>
        ))}
      </ul>

      <section className="mt-16 sm:mt-20">
        <h2 className="font-heading text-3xl tracking-tight">Что заложено в конструкцию</h2>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {project.highlights.map((item) => (
            <li key={item.title} className="grid gap-2 py-6 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-8">
              <h3 className="font-heading text-xl tracking-tight text-olive sm:text-2xl">{item.title}</h3>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 sm:mt-20">
        <h2 className="font-heading text-3xl tracking-tight">Фото и кадры</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Рабочая конфигурация, питание и кадры с испытаний. Полные видеозаписи — в комплекте исходной документации.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.gallery.map((item, index) => (
            <li key={item.src} className="min-w-0">
              <figure>
                <div className="relative aspect-[16/9] overflow-hidden bg-[#f4f2ec]">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
                    unoptimized
                    className="object-cover transition duration-500 hover:scale-[1.02] lab-project-reveal"
                    style={{ animationDelay: `${200 + index * 50}ms` }}
                  />
                </div>
                <figcaption className="mt-3 text-sm text-muted-foreground">{item.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      {project.sections.map((section) => (
        <section key={section.id} id={section.id} className="mt-16 scroll-mt-24 sm:mt-20">
          <h2 className="font-heading text-3xl tracking-tight">{section.title}</h2>
          {section.body?.length ? (
            <div className="mt-5 max-w-2xl space-y-4 text-base leading-relaxed text-muted-foreground">
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          ) : null}
          {section.rows?.length ? (
            <div className="mt-6 max-w-3xl overflow-x-auto border-y border-border">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <tbody>
                  {section.rows.map((row) => (
                    <tr key={`${section.id}-${row.label}`} className="border-b border-border last:border-b-0">
                      <th scope="row" className="py-3 pr-6 font-medium text-foreground align-top">
                        {row.label}
                      </th>
                      <td className="py-3 text-muted-foreground align-top">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {section.list?.length ? (
            <ol className="mt-6 max-w-2xl list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {section.list.map((item) => (
                <li key={item.slice(0, 48)}>{item}</li>
              ))}
            </ol>
          ) : null}
          {section.note ? <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{section.note}</p> : null}
        </section>
      ))}

      <section className="mt-16 sm:mt-20">
        <h2 className="font-heading text-3xl tracking-tight">3D-печатные части</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Старт печати: PETG, слой 0,2 мм, заполнение 30–40 % (ноги и сброс — плотнее). STL-комплект — в исходной документации проекта.
        </p>
        <div className="mt-6 max-w-3xl overflow-x-auto border-y border-border">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <tbody>
              {project.printParts.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-b-0">
                  <th scope="row" className="py-3 pr-6 font-medium text-foreground align-top">
                    {row.label}
                  </th>
                  <td className="py-3 text-muted-foreground align-top">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-16 sm:mt-20">
        <h2 className="font-heading text-3xl tracking-tight">Файлы</h2>
        <ul className="mt-6 divide-y divide-border border-y border-border max-w-2xl">
          {project.downloads.map((file) => (
            <li key={file.href} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
              <div>
                <a
                  href={file.href}
                  download
                  className="font-heading text-xl tracking-tight hover:text-olive"
                >
                  {file.label}
                </a>
                <p className="mt-1 text-sm text-muted-foreground">{file.hint}</p>
              </div>
              <a
                href={file.href}
                download
                className="text-sm underline decoration-border underline-offset-4 hover:decoration-olive"
              >
                Скачать
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          Рама:{" "}
          <a
            href="https://krams.pro/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border underline-offset-4 hover:decoration-olive"
          >
            КРАМС
          </a>
          .
        </p>
      </section>

      <div className="mt-12 max-w-2xl border-t border-border pt-8">
        <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">Назад</p>
        <ul className="mt-4 space-y-3">
          <li>
            <Link href={aboutDirectionHref("proekty")} className="font-heading text-xl tracking-tight hover:text-olive">
              Ко всем проектам
            </Link>
          </li>
          <li>
            <Link href="/o-nas" className="text-sm underline decoration-border underline-offset-4 hover:decoration-olive">
              Ко всей лаборатории
            </Link>
          </li>
        </ul>
      </div>
    </Container>
  );
}
