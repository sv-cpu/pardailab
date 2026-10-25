import { notFound } from "next/navigation";

import { saveAboutAction, saveAboutDevelopmentAction, saveAboutProjectAction } from "@/app/admin/actions";
import { AboutDevelopmentsAdmin } from "@/components/admin/about-developments";
import { AboutDirectionForm } from "@/components/admin/about-forms";
import { AboutProjectsAdmin } from "@/components/admin/about-projects";
import { Notice } from "@/components/admin/ui";
import { getAboutDirection, getAboutLab } from "@/lib/about";
import { requireEditor } from "@/lib/users";

export default async function AboutDirectionAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireEditor();
  const { slug } = await params;
  const query = await searchParams;
  const direction = getAboutDirection(slug);
  if (!direction) notFound();
  const about = getAboutLab();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading text-4xl tracking-tight">{direction.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Подстраница направления в разделе «О нас».</p>
        <div className="mt-4">
          <Notice saved={query.saved} error={query.error} />
        </div>
      </div>
      <AboutDirectionForm direction={direction} action={saveAboutAction} />
      {slug === "proekty" ? <AboutProjectsAdmin projects={about.projects} action={saveAboutProjectAction} /> : null}
      {slug === "razrabotki" ? (
        <AboutDevelopmentsAdmin developments={about.developments} action={saveAboutDevelopmentAction} />
      ) : null}
    </div>
  );
}
