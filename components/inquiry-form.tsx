"use client";

import { useActionState } from "react";

import { submitInquiry, type InquiryFormState } from "@/app/inquiry-actions";

const fieldClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-base text-foreground outline-none focus:border-olive";

export function InquiryForm({
  kind,
  pageTitle,
  pagePath,
  title,
  lede,
  id,
}: {
  kind: "correction" | "letter";
  pageTitle: string;
  pagePath: string;
  title: string;
  lede: string;
  id?: string;
}) {
  const [state, action, pending] = useActionState(submitInquiry, {} as InquiryFormState);
  return (
    <section id={id} className="max-w-xl scroll-mt-24">
      <h2 className="font-heading text-3xl tracking-tight">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{lede}</p>
      {state.ok ? (
        <p className="mt-6 rounded-xl bg-olive-soft px-4 py-3 text-sm">Сообщение получено. Редакция его прочитает.</p>
      ) : (
        <form action={action} className="mt-6 grid gap-4">
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="pageTitle" value={pageTitle} />
          <input type="hidden" name="pagePath" value={pagePath} />
          <input
            type="text"
            name="contact_extra"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0"
          />
          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Как к вам обращаться</span>
            <input name="name" required maxLength={80} autoComplete="name" className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Электронная почта</span>
            <input name="email" type="email" required maxLength={120} autoComplete="email" className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-muted-foreground">Сообщение</span>
            <textarea name="message" required minLength={8} maxLength={4000} rows={5} className={fieldClass} />
          </label>
          {state.error ? <p className="text-sm text-olive-deep">{state.error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="justify-self-start rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep disabled:opacity-60"
          >
            Отправить
          </button>
        </form>
      )}
      <p className="mt-4 text-sm text-muted-foreground">Адрес нужен, чтобы ответить. Другим читателям сообщение не показывается.</p>
    </section>
  );
}
