import { ResumeForm } from "@/components/admin/resume-form";
import { Notice } from "@/components/admin/ui";
import { currentUser, listUsers } from "@/lib/users";

export default async function NewResumePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const actor = await currentUser();
  if (!actor) return null;
  const query = await searchParams;
  const users = listUsers().map((item) => ({ slug: item.slug, name: item.name }));

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8">
      <div>
        <h1 className="font-heading text-4xl tracking-tight">Новое резюме</h1>
        <p className="mt-3 text-muted-foreground">После сохранения появится закрытая ссылка для отправки.</p>
      </div>
      <Notice error={query.error} />
      <ResumeForm users={users} canAssignOwner={actor.role === "editor"} />
    </div>
  );
}
