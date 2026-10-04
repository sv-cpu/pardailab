import { saveModelAction } from "@/app/admin/actions";
import { ModelForm } from "@/components/admin/forms";
import { Notice } from "@/components/admin/ui";

export default async function NewModelPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl tracking-tight">Новая модель</h1>
      <div className="mb-5">
        <Notice error={query.error} />
      </div>
      <ModelForm action={saveModelAction} />
    </div>
  );
}
