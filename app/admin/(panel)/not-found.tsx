import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1 className="font-heading text-4xl tracking-tight">Такой записи нет</h1>
      <Link href="/admin" className="mt-6 inline-block text-olive">
        К обзору
      </Link>
    </div>
  );
}
