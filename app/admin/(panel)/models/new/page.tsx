import { saveModelAction } from "@/app/admin/actions";
import { ModelForm } from "@/components/admin/forms";
import { Notice } from "@/components/admin/ui";
import { requireEditor } from "@/lib/users";

export default async function NewModelPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireEditor();
  const query = await searchParams;
  return (
    <div>
      <h1 className="mb-6 font-heading text-4xl tracking-tight">Новая модель</h1>
      <div className="mb-5">
        <Notice error={query.error} />
      </div>
      <ModelForm action={saveModelAction} />
    </div>
  );
}
