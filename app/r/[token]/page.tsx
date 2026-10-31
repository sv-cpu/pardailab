import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ResumeView } from "@/components/resume-view";
import { findResumeByToken, resumePublicPath } from "@/lib/resumes";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const resume = findResumeByToken(token);
  if (!resume) return { title: "Резюме не найдено", robots: { index: false, follow: false } };
  return {
    title: `${resume.person.fullName} — резюме`,
    description: resume.jobs[0]?.position
      ? `${resume.person.fullName} — ${resume.jobs[0].position}`
      : `Резюме: ${resume.person.fullName}`,
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
    alternates: { canonical: new URL(resumePublicPath(resume.token), site.url).toString() },
  };
}

export default async function ResumePage({ params }: Props) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(token)) notFound();
  const resume = findResumeByToken(token);
  if (!resume) notFound();
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <p className="font-heading text-sm tracking-tight text-olive">{site.name}</p>
          <p className="text-xs text-muted-foreground">Закрытая ссылка</p>
        </div>
      </div>
      <ResumeView resume={resume} />
    </div>
  );
}
