import { notFound, redirect } from "next/navigation";

import { ResumeForm } from "@/components/admin/resume-form";
import { Notice } from "@/components/admin/ui";
import { canManageResume, findResumeById } from "@/lib/resumes";
import { currentUser, listUsers } from "@/lib/users";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function EditResumePage({ params, searchParams }: Props) {
  const actor = await currentUser();
  if (!actor) return null;
  const { id } = await params;
  const query = await searchParams;
  const resume = findResumeById(id);
  if (!resume) notFound();
  if (!canManageResume(resume, actor)) redirect("/admin/resumes");
  const users = listUsers().map((item) => ({ slug: item.slug, name: item.name }));

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8">
      <div>
        <h1 className="font-heading text-4xl tracking-tight">{resume.person.fullName}</h1>
        <p className="mt-3 text-muted-foreground">Редактирование резюме и закрытой ссылки.</p>
      </div>
      <Notice saved={query.saved === "1" ? "1" : undefined} error={query.error} />
      {query.saved === "link" ? (
        <p className="rounded-xl bg-olive-soft px-4 py-3 text-sm text-olive-deep">Ссылка обновлена. Старая больше не работает.</p>
      ) : null}
      <ResumeForm resume={resume} users={users} canAssignOwner={actor.role === "editor"} />
    </div>
  );
}
