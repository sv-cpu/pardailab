import Link from "next/link";

import { saveAboutAction } from "@/app/admin/actions";
import { AboutHubForm } from "@/components/admin/about-forms";
import { Notice } from "@/components/admin/ui";
import { aboutDirectionHref, getAboutLab } from "@/lib/about";
import { requireEditor } from "@/lib/users";

export default async function AboutAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireEditor();
  const query = await searchParams;
  const about = getAboutLab();
  return (
    <div className="grid gap-10">
      <div>
        <h1 className="font-heading text-4xl tracking-tight">О нас</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Главная страница лаборатории и четыре направления. Текст правится в полях ниже, изображения — через загрузку
          кадра 16:9.
        </p>
        <div className="mt-4">
          <Notice saved={query.saved} error={query.error} />
        </div>
      </div>

      <section className="grid gap-4">
        <h2 className="font-heading text-2xl tracking-tight">Направления</h2>
        <ul className="divide-y divide-border border-y border-border">
          {about.directions.map((item) => (
            <li key={item.slug} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
              <div>
                <Link href={`/admin/about/${item.slug}`} className="font-heading text-xl hover:text-olive">
                  {item.title}
                </Link>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">{item.teaser}</p>
              </div>
              <a href={aboutDirectionHref(item.slug)} className="text-sm text-olive">
                На сайте
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4">
        <h2 className="font-heading text-2xl tracking-tight">Главная страница</h2>
        <AboutHubForm about={about} action={saveAboutAction} />
      </section>
    </div>
  );
}
