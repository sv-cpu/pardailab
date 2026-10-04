import { notFound } from "next/navigation";

import { saveServiceAction } from "@/app/admin/actions";
import { ServiceForm } from "@/components/admin/forms";
import { Notice } from "@/components/admin/ui";
import { listServices } from "@/lib/db";

export default async function EditServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const service = listServices().find((item) => item.slug === slug);
  if (!service) notFound();
  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl tracking-tight">Сервис</h1>
      <div className="mb-5">
        <Notice saved={query.saved} error={query.error} />
      </div>
      <ServiceForm service={service} action={saveServiceAction} />
    </div>
  );
}
