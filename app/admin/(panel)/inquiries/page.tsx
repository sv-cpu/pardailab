import Link from "next/link";

import { formatPublished } from "@/lib/format";
import { inquiryKindLabel, inquiryStatusLabel, listInquiries } from "@/lib/inquiries";

export default function InquiriesPage() {
  const rows = listInquiries();
  return (
    <div>
      <h1 className="font-heading text-4xl tracking-tight">Обращения</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Сюда попадают письма редакции и замечания к материалам, карточкам и выпускам шкалы.
      </p>
      {rows.length === 0 ? (
        <p className="mt-8 text-muted-foreground">Пока обращений нет.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {rows.map((item) => (
            <li key={item.id}>
              <Link href={`/admin/inquiries/${item.id}`} className="block py-4 hover:text-olive">
                <p className="font-mono text-[11px] tracking-[0.14em] text-olive uppercase">
                  {inquiryStatusLabel[item.status]} · {inquiryKindLabel[item.kind]}
                </p>
                <p className="mt-2 font-heading text-2xl">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.pageTitle || "Без страницы"} · {formatPublished(item.createdAt)}
                </p>
                <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{item.message}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
