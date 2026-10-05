import { saveProfileAction } from "@/app/admin/actions";
import { Notice, fieldClass } from "@/components/admin/ui";
import { currentUser, roleLabel } from "@/lib/users";
import { redirect } from "next/navigation";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  const query = await searchParams;
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-5">
      <h1 className="font-heading text-4xl tracking-tight">Профиль</h1>
      <p className="text-sm text-muted-foreground">
        {roleLabel[user.role]} · логин {user.login}. Страница на сайте: /avtory/{user.slug}
      </p>
      <Notice saved={query.saved} error={query.error} />
      <form action={saveProfileAction} className="grid gap-4">
        {user.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photo} alt="" className="size-24 object-cover" />
        ) : null}
        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">Имя</span>
          <input name="name" defaultValue={user.name} required className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">О себе</span>
          <textarea name="bio" defaultValue={user.bio} rows={5} className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">Фото</span>
          <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-muted-foreground">Новый пароль</span>
          <input name="password" type="password" className={fieldClass} />
        </label>
        <button type="submit" className="justify-self-start rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground">
          Сохранить
        </button>
      </form>
    </div>
  );
}
