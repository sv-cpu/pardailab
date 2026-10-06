import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteInquiryAction, setInquiryStatusAction } from "@/app/admin/inquiry-actions";
import { formatPublished } from "@/lib/format";
import { inquiryKindLabel, openInquiry } from "@/lib/inquiries";
import { currentUser } from "@/lib/users";

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id)) notFound();
  const item = openInquiry(id);
  if (!item) notFound();
  const user = await currentUser();
  return (
    <div className="max-w-2xl">
      <p className="text-sm">
        <Link href="/admin/inquiries" className="text-olive">
          Все обращения
        </Link>
      </p>
      <p className="mt-6 font-mono text-[11px] tracking-[0.14em] text-olive uppercase">{inquiryKindLabel[item.kind]}</p>
      <h1 className="mt-3 font-heading text-4xl tracking-tight">{item.name}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{formatPublished(item.createdAt)}</p>
      <p className="mt-6">
        <a href={`mailto:${item.email}`} className="underline decoration-border underline-offset-4 hover:decoration-olive">
          {item.email}
        </a>
      </p>
      {item.pagePath ? (
        <p className="mt-3 text-sm">
          <Link href={item.pagePath} className="underline decoration-border underline-offset-4 hover:decoration-olive">
            {item.pageTitle || item.pagePath}
          </Link>
        </p>
      ) : item.pageTitle ? (
        <p className="mt-3 text-sm text-muted-foreground">{item.pageTitle}</p>
      ) : null}
      <p className="mt-8 whitespace-pre-wrap text-lg leading-relaxed">{item.message}</p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <form action={setInquiryStatusAction}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="status" value={item.status === "done" ? "read" : "done"} />
          <button type="submit" className="rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep">
            {item.status === "done" ? "Вернуть в работу" : "Разобрано"}
          </button>
        </form>
        {user?.role === "editor" ? (
          <form action={deleteInquiryAction}>
            <input type="hidden" name="id" value={item.id} />
            <button type="submit" className="text-sm text-muted-foreground">
              Удалить
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
