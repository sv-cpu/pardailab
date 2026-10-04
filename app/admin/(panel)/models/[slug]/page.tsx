import { notFound } from "next/navigation";

import { saveModelAction } from "@/app/admin/actions";
import { ModelForm } from "@/components/admin/forms";
import { Notice } from "@/components/admin/ui";
import { listModels } from "@/lib/db";

export default async function EditModelPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const model = listModels().find((item) => item.slug === slug);
  if (!model) notFound();
  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl tracking-tight">Модель</h1>
      <div className="mb-5">
        <Notice saved={query.saved} error={query.error} />
      </div>
      <ModelForm model={model} action={saveModelAction} />
    </div>
  );
}
