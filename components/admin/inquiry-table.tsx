"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { patchInquiryAction } from "@/app/admin/inquiry-actions";
import {
  filterInquiries,
  inquiryFolderCounts,
  inquiryFolderLabel,
  inquiryFolders,
  inquiryInFolder,
  type InquiryFolder,
  type InquiryListRow,
  type InquiryListStatus,
} from "@/lib/inquiry-list";
import { cn } from "@/lib/utils";

import { fieldClass } from "./ui";

const actionClass = "text-sm text-olive disabled:text-muted-foreground";
const quietClass = "text-sm text-muted-foreground disabled:text-muted-foreground";

export function InquiryTable({ rows, initialFolder }: { rows: InquiryListRow[]; initialFolder: InquiryFolder }) {
  const router = useRouter();
  const [folder, setFolder] = useState(initialFolder);
  const [text, setText] = useState("");
  const [kind, setKind] = useState("");
  const counts = useMemo(() => inquiryFolderCounts(rows), [rows]);
  const inFolder = useMemo(() => rows.filter((row) => inquiryInFolder(row, folder)), [rows, folder]);
  const shown = useMemo(() => filterInquiries(rows, folder, text, kind), [rows, folder, text, kind]);
  const narrowed = text.trim() !== "" || kind !== "";

  function openFolder(next: InquiryFolder) {
    setFolder(next);
    setText("");
    setKind("");
    router.replace(next === "new" ? "/admin/inquiries" : `/admin/inquiries?folder=${next}`, { scroll: false });
  }

  return (
    <div>
      <h1 className="font-heading text-4xl tracking-tight">Обращения</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Письма редакции и замечания к материалам. Новое письмо становится прочитанным, когда его открывают.
      </p>
      <div className="mt-6 flex flex-wrap gap-2" aria-label="Папки">
        {inquiryFolders.map((item) => (
          <button
            key={item}
            type="button"
            aria-current={folder === item ? "page" : undefined}
            onClick={() => openFolder(item)}
            className={cn("px-3 py-2 text-sm", folder === item ? "bg-olive-soft text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {inquiryFolderLabel[item]}
            <span className="ml-2 font-mono text-xs">{counts[item]}</span>
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="mt-8 text-muted-foreground">Пока обращений нет.</p>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <input
              value={text}
              placeholder="Имя, почта или текст"
              aria-label="Поиск по обращениям"
              onChange={(event) => setText(event.target.value)}
              className={fieldClass}
            />
            <select aria-label="Тип обращения" value={kind} onChange={(event) => setKind(event.target.value)} className={fieldClass}>
              <option value="">Письма и замечания</option>
              <option value="letter">Письма</option>
              <option value="correction">Замечания</option>
            </select>
          </div>
          {narrowed ? (
            <button
              type="button"
              className="mt-3 text-sm text-olive"
              onClick={() => {
                setText("");
                setKind("");
              }}
            >
              Сбросить
            </button>
          ) : null}
          {inFolder.length === 0 ? (
            <p className="mt-8 text-muted-foreground">В этой папке пусто.</p>
          ) : shown.length === 0 ? (
            <p className="mt-8 text-muted-foreground">Ничего не найдено.</p>
          ) : (
            <div className="mt-4 overflow-x-auto border-y border-border">
              <table className="w-full min-w-[58rem] text-left text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="py-3 pr-4 font-normal">От кого</th>
                    <th className="py-3 pr-4 font-normal">Почта</th>
                    <th className="py-3 pr-4 font-normal">Тип</th>
                    <th className="py-3 pr-4 font-normal">Страница</th>
                    <th className="py-3 pr-4 font-normal">Текст</th>
                    <th className="py-3 pr-4 font-normal">Дата</th>
                    <th className="py-3 font-normal">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((row) => (
                    <tr key={row.id} className="border-t border-border">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/inquiries/${row.id}?from=${folder}`}
                          className={cn("hover:text-olive", row.status === "new" ? "font-medium text-foreground" : "text-foreground")}
                        >
                          {row.name}
                        </Link>
                      </td>
                      <td className="max-w-[12rem] truncate py-3 pr-4 text-muted-foreground">
                        <a href={`mailto:${row.email}`} className="hover:text-olive">
                          {row.email}
                        </a>
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">{row.kindLabel}</td>
                      <td className="max-w-[14rem] truncate py-3 pr-4 text-muted-foreground">
                        {row.pagePath ? (
                          <Link href={row.pagePath} className="hover:text-olive">
                            {row.pageTitle || row.pagePath}
                          </Link>
                        ) : (
                          row.pageTitle || "—"
                        )}
                      </td>
                      <td className="max-w-[18rem] truncate py-3 pr-4 text-muted-foreground">{row.preview}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">{row.dateLabel}</td>
                      <td className="py-3 whitespace-nowrap">
                        <InquiryActions id={row.id} status={row.status} important={row.important} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function InquiryActions({
  id,
  status,
  important,
}: {
  id: number;
  status: InquiryListStatus;
  important: boolean;
}) {
  const router = useRouter();
  const [locked, startTransition] = useTransition();

  function patch(next: { status?: InquiryListStatus; important?: boolean }) {
    startTransition(async () => {
      await patchInquiryAction(id, next);
      router.refresh();
    });
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      {status === "archive" ? (
        <button type="button" disabled={locked} className={actionClass} onClick={() => patch({ status: "read" })}>
          Вернуть
        </button>
      ) : (
        <>
          {status === "new" ? (
            <button type="button" disabled={locked} className={actionClass} onClick={() => patch({ status: "read" })}>
              Прочитано
            </button>
          ) : null}
          <button type="button" disabled={locked} className={actionClass} onClick={() => patch({ status: "archive" })}>
            В архив
          </button>
          <button
            type="button"
            disabled={locked}
            aria-pressed={important}
            className={important ? actionClass : quietClass}
            onClick={() => patch({ important: !important })}
          >
            {important ? "Снять важное" : "Важное"}
          </button>
        </>
      )}
    </span>
  );
}
