"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/admin/actions";

import { Field, fieldClass } from "./ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {} as LoginState);
  return (
    <form action={action} className="grid gap-4">
      <Field label="Логин">
        <input name="user" autoComplete="username" required className={fieldClass} />
      </Field>
      <Field label="Пароль">
        <input name="password" type="password" autoComplete="current-password" required className={fieldClass} />
      </Field>
      {state.error ? <p className="text-sm text-olive-deep">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep disabled:opacity-60">
        Войти
      </button>
    </form>
  );
}
