import { saveRubricAction } from "@/app/admin/actions";
import { Notice, fieldClass } from "@/components/admin/ui";
import { listRubrics } from "@/lib/rubrics";
import { requireEditor } from "@/lib/users";

export default async function RubricsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireEditor();
  const query = await searchParams;
  const rubrics = listRubrics();
  const parents = rubrics.filter((item) => !item.parent);
  return (
    <div>
      <h1 className="font-heading text-4xl tracking-tight">Рубрики</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Подрубрики открываются в меню сайта списком у своей рубрики.
      </p>
      <div className="mt-6">
        <Notice saved={query.saved} error={query.error} />
      </div>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {parents.map((parent) => {
          const children = rubrics.filter((item) => item.parent === parent.slug);
          return (
            <li key={parent.slug} className="py-6">
              <form action={saveRubricAction} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="intent" value="rename" />
                <input type="hidden" name="slug" value={parent.slug} />
                <input name="name" defaultValue={parent.name} required className={`${fieldClass} max-w-sm`} />
                <button type="submit" className="text-sm text-olive">
                  Сохранить
                </button>
              </form>
              <ul className="mt-4 grid gap-3 pl-4">
                {children.map((child) => (
                  <li key={child.slug} className="flex flex-wrap items-center gap-3">
                    <form action={saveRubricAction} className="flex flex-wrap items-center gap-3">
                      <input type="hidden" name="intent" value="rename" />
                      <input type="hidden" name="slug" value={child.slug} />
                      <input name="name" defaultValue={child.name} required className={`${fieldClass} max-w-xs`} />
                      <button type="submit" className="text-sm text-olive">
                        Сохранить
                      </button>
                    </form>
                    <form action={saveRubricAction}>
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="slug" value={child.slug} />
                      <button type="submit" className="text-sm text-muted-foreground">
                        Удалить
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
              <form action={saveRubricAction} className="mt-4 flex flex-wrap items-center gap-3 pl-4">
                <input type="hidden" name="intent" value="child" />
                <input type="hidden" name="parent" value={parent.slug} />
                <input name="name" placeholder="Новая подрубрика" required className={`${fieldClass} max-w-xs`} />
                <button type="submit" className="text-sm text-olive">
                  Добавить подрубрику
                </button>
              </form>
              {parent.kind ? null : (
                <form action={saveRubricAction} className="mt-3">
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="slug" value={parent.slug} />
                  <button type="submit" className="text-sm text-muted-foreground">
                    Удалить рубрику
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
      <form action={saveRubricAction} className="mt-8 flex flex-wrap items-center gap-3">
        <input type="hidden" name="intent" value="parent" />
        <input name="name" placeholder="Новая рубрика" required className={`${fieldClass} max-w-sm`} />
        <button type="submit" className="rounded-full bg-olive px-4 py-2 text-sm text-accent-foreground">
          Добавить рубрику
        </button>
      </form>
    </div>
  );
}
