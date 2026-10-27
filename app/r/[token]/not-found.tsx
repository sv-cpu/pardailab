import Link from "next/link";

export default function ResumeNotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="max-w-md text-center">
        <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">Резюме</p>
        <h1 className="mt-3 font-heading text-3xl tracking-tight">Ссылка недоступна</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Резюме удалено или ссылка устарела. Запросите новую ссылку у владельца.
        </p>
        <p className="mt-6">
          <Link href="/" className="text-sm text-olive underline decoration-border underline-offset-4 hover:decoration-olive">
            На главную
          </Link>
        </p>
      </div>
    </div>
  );
}
