import { saveServiceAction } from "@/app/admin/actions";
import { ServiceForm } from "@/components/admin/forms";
import { Notice } from "@/components/admin/ui";
import { requireEditor } from "@/lib/users";

export default async function NewServicePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireEditor();
  const query = await searchParams;
  return (
    <div>
      <h1 className="mb-6 font-heading text-4xl tracking-tight">Новый сервис</h1>
      <div className="mb-5">
        <Notice error={query.error} />
      </div>
      <ServiceForm action={saveServiceAction} />
    </div>
  );
}
