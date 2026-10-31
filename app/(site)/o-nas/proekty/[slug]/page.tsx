import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LabProjectView } from "@/components/lab-project-view";
import { getAboutLab } from "@/lib/about";
import { labProjectHref, labProjectSlugs, resolveLabProject } from "@/lib/lab-projects";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return labProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = resolveLabProject(slug, getAboutLab().projects);
  if (!project) return {};
  return pageMeta({
    title: `${project.title} — Проекты`,
    description: project.teaser,
    path: labProjectHref(project.slug),
  });
}

export default async function LabProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = resolveLabProject(slug, getAboutLab().projects);
  if (!project) notFound();
  return <LabProjectView project={project} />;
}
