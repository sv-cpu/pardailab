import Image from "next/image";
import Link from "next/link";

import type { AboutProject } from "@/lib/about.shared";
import { aboutParagraphs } from "@/lib/about.shared";

function Description({ text }: { text: string }) {
  const parts = aboutParagraphs(text);
  if (!parts.length) return null;
  return (
    <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
      {parts.map((part, index) => (
        <p key={`${index}-${part.slice(0, 24)}`}>{part}</p>
      ))}
    </div>
  );
}

export function AboutProjectGrid({ projects }: { projects: AboutProject[] }) {
  if (!projects.length) return null;
  return (
    <section className="mt-16 sm:mt-20">
      <h2 className="font-heading text-3xl tracking-tight">Проекты</h2>
      <ul className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const media = (
            <div className="relative aspect-[16/9] overflow-hidden bg-[#f4f2ec]">
              <Image
                src={project.cover}
                alt=""
                fill
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
                unoptimized={project.cover.startsWith("/uploads/") || project.cover.startsWith("/projects/")}
                className="object-cover transition duration-500 group-hover:scale-[1.02]"
              />
            </div>
          );
          return (
            <li key={project.id} className="min-w-0">
              <article className="group">
                {project.url ? (
                  <Link href={project.url} className="block" {...externalProps(project.url)}>
                    {media}
                  </Link>
                ) : (
                  media
                )}
                <h3 className="mt-4 font-heading text-2xl tracking-tight">
                  {project.url ? (
                    <Link href={project.url} className="hover:text-olive" {...externalProps(project.url)}>
                      {project.title}
                    </Link>
                  ) : (
                    project.title
                  )}
                </h3>
                <Description text={project.description} />
                {project.url ? (
                  <p className="mt-4">
                    <Link
                      href={project.url}
                      className="text-sm underline decoration-border underline-offset-4 hover:decoration-olive"
                      {...externalProps(project.url)}
                    >
                      Открыть проект
                    </Link>
                  </p>
                ) : null}
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function externalProps(href: string) {
  if (href.startsWith("/")) return {};
  return { target: "_blank" as const, rel: "noopener noreferrer" };
}
