import { savePasswordAction, saveProfileAction } from "@/app/admin/actions";
import { ProfileForm } from "@/components/admin/profile-form";
import { Field, Notice, fieldClass } from "@/components/admin/ui";
import { currentUser, roleLabel } from "@/lib/users";
import { redirect } from "next/navigation";

function ProfileNotice({ saved, error }: { saved?: string; error?: string }) {
  if (error) return <Notice error={error} />;
  if (saved === "password") {
    return <p className="rounded-xl bg-olive-soft px-4 py-3 text-sm text-olive-deep">Пароль изменён.</p>;
  }
  return <Notice saved={saved} />;
}

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  const query = await searchParams;
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-8">
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">Учётная запись</p>
        <h1 className="mt-3 font-heading text-4xl tracking-tight">Профиль</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Имя, текст и фото попадают на вашу страницу автора. Пароль меняется отдельно и не сбрасывает эти поля.
        </p>
      </div>
      <ProfileNotice saved={query.saved} error={query.error} />
      <ProfileForm
        action={saveProfileAction}
        user={{
          name: user.name,
          bio: user.bio,
          photo: user.photo,
          slug: user.slug,
          login: user.login,
          roleLabel: roleLabel[user.role],
        }}
      />
      <section className="grid gap-4 border-t border-border pt-8">
        <h2 className="font-heading text-2xl tracking-tight">Пароль</h2>
        <p className="text-sm text-muted-foreground">Нужен текущий пароль. Новый — не короче 8 знаков.</p>
        <form action={savePasswordAction} className="grid max-w-md gap-4">
          <Field label="Текущий пароль">
            <input name="currentPassword" type="password" autoComplete="current-password" required className={fieldClass} />
          </Field>
          <Field label="Новый пароль">
            <input name="password" type="password" autoComplete="new-password" required minLength={8} className={fieldClass} />
          </Field>
          <Field label="Повтор нового пароля">
            <input name="passwordAgain" type="password" autoComplete="new-password" required minLength={8} className={fieldClass} />
          </Field>
          <button type="submit" className="justify-self-start rounded-full border border-border px-5 py-2.5 text-sm hover:border-olive">
            Сменить пароль
          </button>
        </form>
      </section>
    </div>
  );
}
