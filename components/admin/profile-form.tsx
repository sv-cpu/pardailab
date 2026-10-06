"use client";

import { useState } from "react";

import { AvatarField } from "@/components/admin/avatar-field";
import { Field, fieldClass } from "@/components/admin/ui";

export function ProfileForm({
  user,
  action,
}: {
  user: { name: string; bio: string; photo?: string; slug: string; login: string; roleLabel: string };
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const shownName = name.trim() || "Имя";
  const shownBio = bio.trim();

  return (
    <form action={action} className="grid gap-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">Как видят читатели</p>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
          <AvatarField photo={user.photo} fallback={shownName} />
          <div className="min-w-0">
            <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">{user.roleLabel}</p>
            <p className="mt-2 font-heading text-3xl tracking-tight">{shownName}</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {shownBio || "Короткий текст о себе появится под именем."}
            </p>
            <a href={`/avtory/${user.slug}`} className="mt-4 inline-block text-sm text-olive hover:underline">
              Открыть страницу автора
            </a>
          </div>
        </div>
      </section>
      <section className="grid gap-4">
        <h2 className="font-heading text-2xl tracking-tight">Имя и текст</h2>
        <Field label="Имя на сайте">
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoComplete="name"
            className={fieldClass}
          />
        </Field>
        <Field label="О себе">
          <textarea
            name="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={5}
            className={fieldClass}
          />
        </Field>
        <p className="text-sm text-muted-foreground">
          Логин {user.login}. Страница автора остаётся по адресу /avtory/{user.slug}.
        </p>
        <button type="submit" className="justify-self-start rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep">
          Сохранить профиль
        </button>
      </section>
    </form>
  );
}
