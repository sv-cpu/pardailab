import Link from "next/link";

import { createSampleResumeAction } from "@/app/admin/resume-actions";
import { Notice } from "@/components/admin/ui";
import { formatPublished } from "@/lib/format";
import { listResumesFor, resumePublicUrl } from "@/lib/resumes";
import { currentUser, findUserBySlug } from "@/lib/users";

export default async function ResumesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const actor = await currentUser();
  if (!actor) return null;
  const query = await searchParams;
  const rows = listResumesFor(actor);

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl tracking-tight">Резюме</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Резюме сотрудников доступны только по закрытой ссылке. На сайте они нигде не публикуются.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actor.role === "editor" ? (
            <form action={createSampleResumeAction}>
              <button
                type="submit"
                className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:border-olive hover:text-foreground"
              >
                Пример резюме
              </button>
            </form>
          ) : null}
          <Link
            href="/admin/resumes/new"
            className="rounded-full bg-olive px-4 py-2 text-sm text-accent-foreground hover:bg-olive-deep"
          >
            Новое резюме
          </Link>
        </div>
      </div>

      <Notice saved={query.saved === "1" ? "1" : undefined} error={query.error} />
      {query.saved === "link" ? (
        <p className="rounded-xl bg-olive-soft px-4 py-3 text-sm text-olive-deep">Ссылка обновлена. Старая больше не работает.</p>
      ) : null}

      {rows.length ? (
        <ul className="divide-y divide-border border-y border-border">
          {rows.map((item) => {
            const owner = findUserBySlug(item.ownerSlug);
            return (
              <li key={item.id} className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <Link href={`/admin/resumes/${item.id}`} className="font-heading text-2xl hover:text-olive">
                    {item.person.fullName}
                  </Link>
                  {item.target.title ? (
                    <p className="mt-1 max-w-xl text-sm text-muted-foreground">{item.target.title}</p>
                  ) : null}
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    {owner ? owner.name : item.ownerSlug}
                    {" · "}
                    обновлено {formatPublished(item.updatedAt.slice(0, 16))}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <Link href={`/admin/resumes/${item.id}`} className="text-olive hover:text-olive-deep">
                    Править
                  </Link>
                  <a
                    href={resumePublicUrl(item.token)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Открыть ссылку
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="border-y border-border py-8 text-sm text-muted-foreground">Пока нет резюме. Создайте первое.</p>
      )}
    </div>
  );
}
