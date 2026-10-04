import Link from "next/link";

export const fieldClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-olive";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function Notice({ saved, error }: { saved?: string; error?: string }) {
  if (error) return <p className="rounded-xl bg-olive-soft px-4 py-3 text-sm text-olive-deep">{error}</p>;
  if (saved === "1") return <p className="rounded-xl bg-olive-soft px-4 py-3 text-sm text-olive-deep">Сохранено.</p>;
  return null;
}

export function RecordList({
  title,
  href,
  rows,
}: {
  title: string;
  href: string;
  rows: { slug: string; title: string; meta: string }[];
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-heading text-4xl tracking-tight">{title}</h1>
        <Link href={href} className="rounded-full bg-olive px-4 py-2 text-sm text-accent-foreground hover:bg-olive-deep">
          Новая запись
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {rows.map((row) => (
          <li key={row.slug}>
            <Link href={`${href.replace(/\/new$/, "")}/${row.slug}`} className="flex items-baseline justify-between gap-4 py-4 hover:text-olive">
              <span className="font-heading text-2xl">{row.title}</span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{row.meta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
