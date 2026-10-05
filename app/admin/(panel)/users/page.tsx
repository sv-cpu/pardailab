import { saveUserAction } from "@/app/admin/actions";
import { Notice, fieldClass } from "@/components/admin/ui";
import { listUsers, requireEditor, roleLabel, type StaffRole } from "@/lib/users";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const actor = await requireEditor();
  const query = await searchParams;
  const users = listUsers();
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-8">
      <div>
        <h1 className="font-heading text-4xl tracking-tight">Пользователи</h1>
        <p className="mt-3 text-muted-foreground">Редактор ведёт редакцию. Журналист пишет свои материалы и свой профиль.</p>
      </div>
      <Notice saved={query.saved} error={query.error} />
      <ul className="divide-y divide-border border-y border-border">
        {users.map((user) => (
          <li key={user.slug} className="grid gap-3 py-5">
            <form action={saveUserAction} className="grid gap-3">
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="slug" value={user.slug} />
              <p className="text-sm text-muted-foreground">Логин {user.login}</p>
              <input name="name" defaultValue={user.name} required className={fieldClass} />
              <textarea name="bio" defaultValue={user.bio} rows={3} placeholder="О себе" className={fieldClass} />
              <select name="role" defaultValue={user.role} className={fieldClass}>
                {(Object.keys(roleLabel) as StaffRole[]).map((role) => (
                  <option key={role} value={role}>
                    {roleLabel[role]}
                  </option>
                ))}
              </select>
              <input name="password" type="password" placeholder="Новый пароль, если нужно сменить" className={fieldClass} />
              <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
              <button type="submit" className="justify-self-start text-sm text-olive">
                Сохранить
              </button>
            </form>
            {user.slug === actor.slug ? null : (
              <form action={saveUserAction}>
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="slug" value={user.slug} />
                <button type="submit" className="text-sm text-muted-foreground">
                  Удалить
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
      <form action={saveUserAction} className="grid gap-3">
        <h2 className="font-heading text-2xl">Новый пользователь</h2>
        <input name="name" placeholder="Имя" required className={fieldClass} />
        <input name="login" placeholder="Логин" required className={fieldClass} />
        <input name="password" type="password" placeholder="Пароль" required className={fieldClass} />
        <textarea name="bio" placeholder="О себе" rows={3} className={fieldClass} />
        <select name="role" defaultValue="journalist" className={fieldClass}>
          <option value="journalist">Журналист</option>
          <option value="editor">Редактор</option>
        </select>
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
        <button type="submit" className="justify-self-start rounded-full bg-olive px-4 py-2 text-sm text-accent-foreground">
          Добавить
        </button>
      </form>
    </div>
  );
}
