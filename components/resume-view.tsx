import { ResumePrintButton } from "@/components/resume-print-button";
import {
  formatBirthLine,
  formatJobDuration,
  formatJobPeriod,
  formatUpdatedAt,
  type Resume,
} from "@/lib/resumes.shared";

function Paragraphs({ text }: { text: string }) {
  const parts = text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (!parts.length) return null;
  return (
    <div className="space-y-3">
      {parts.map((part, index) => (
        <p key={index} className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
          {part}
        </p>
      ))}
    </div>
  );
}

function BulletList({ items, title }: { items: string[]; title?: string }) {
  if (!items.length) return null;
  return (
    <div className="mt-4">
      {title ? <p className="text-sm font-medium text-foreground">{title}</p> : null}
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-foreground/90">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function MetaLine({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] leading-relaxed text-muted-foreground">{children}</p>;
}

export function ResumeView({ resume }: { resume: Resume }) {
  const birth = formatBirthLine(resume.person);
  const updated = formatUpdatedAt(resume.updatedAt);
  const shortName = resume.person.fullName.split(/\s+/).slice(0, 2).join(" ");

  return (
    <article className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14 print:max-w-none print:px-0 print:py-0">
      <header className="border-b border-border pb-8">
        <p className="font-mono text-[11px] tracking-[0.16em] text-olive uppercase">Резюме</p>
        <h1 className="mt-3 font-heading text-4xl leading-tight tracking-tight text-balance sm:text-5xl">
          {resume.person.fullName}
        </h1>
        {birth ? <p className="mt-3 text-[15px] text-muted-foreground">{birth}</p> : null}

        <div className="mt-6 space-y-1.5">
          {resume.person.phone ? (
            <MetaLine>
              <a href={`tel:${resume.person.phone.replace(/[^\d+]/g, "")}`} className="text-foreground hover:text-olive">
                {resume.person.phone}
              </a>
              {resume.person.phoneNote ? ` — ${resume.person.phoneNote}` : null}
            </MetaLine>
          ) : null}
          {resume.person.email ? (
            <MetaLine>
              <a href={`mailto:${resume.person.email}`} className="text-foreground hover:text-olive">
                {resume.person.email}
              </a>
            </MetaLine>
          ) : null}
          {resume.person.city ? <MetaLine>Проживает: {resume.person.city}</MetaLine> : null}
          {resume.person.citizenship || resume.person.workPermit ? (
            <MetaLine>
              {[
                resume.person.citizenship ? `Гражданство: ${resume.person.citizenship}` : "",
                resume.person.workPermit ? `есть разрешение на работу: ${resume.person.workPermit}` : "",
              ]
                .filter(Boolean)
                .join(", ")}
            </MetaLine>
          ) : null}
          {resume.person.relocation || resume.person.businessTrips ? (
            <MetaLine>
              {[resume.person.relocation, resume.person.businessTrips].filter(Boolean).join(", ")}
            </MetaLine>
          ) : null}
        </div>
      </header>

      {(resume.target.title ||
        resume.target.specializations.length ||
        resume.target.employmentType ||
        resume.target.workFormat ||
        resume.target.commute ||
        resume.target.salary) && (
        <section className="border-b border-border py-8">
          <h2 className="font-heading text-2xl tracking-tight">Желаемая должность и зарплата</h2>
          {resume.target.title ? (
            <p className="mt-4 text-lg leading-snug font-medium text-balance">{resume.target.title}</p>
          ) : null}
          {resume.target.salary ? <p className="mt-2 text-[15px] text-muted-foreground">{resume.target.salary}</p> : null}
          {resume.target.specializations.length ? (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Специализации:</p>
              <ul className="mt-2 space-y-1 text-[15px]">
                {resume.target.specializations.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-4 space-y-1 text-[15px] text-muted-foreground">
            {resume.target.employmentType ? <p>Тип занятости: {resume.target.employmentType}</p> : null}
            {resume.target.workFormat ? <p>Формат работы: {resume.target.workFormat}</p> : null}
            {resume.target.commute ? <p>Желательное время в пути до работы: {resume.target.commute}</p> : null}
          </div>
        </section>
      )}

      {resume.jobs.length ? (
        <section className="border-b border-border py-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-heading text-2xl tracking-tight">Опыт работы</h2>
            {resume.experienceLabel ? (
              <p className="text-sm text-muted-foreground">— {resume.experienceLabel}</p>
            ) : null}
          </div>
          <div className="mt-8 space-y-10">
            {resume.jobs.map((job, index) => {
              const duration = formatJobDuration(job);
              return (
                <div key={`${job.company}-${job.start}-${index}`} className="grid gap-4 sm:grid-cols-[11rem_1fr]">
                  <div className="text-sm text-muted-foreground">
                    <p>{formatJobPeriod(job)}</p>
                    {duration ? <p className="mt-1">{duration}</p> : null}
                  </div>
                  <div>
                    <p className="font-heading text-xl tracking-tight">{job.company}</p>
                    {job.city || job.industry ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[job.city, job.industry].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                    {job.position ? <p className="mt-3 font-medium">{job.position}</p> : null}
                    {job.summary ? (
                      <div className="mt-3">
                        <Paragraphs text={job.summary} />
                      </div>
                    ) : null}
                    <BulletList title="Основные обязанности:" items={job.duties} />
                    <BulletList title="Ключевые компетенции:" items={job.competencies} />
                    {job.projects.length ? (
                      <div className="mt-4">
                        <p className="text-sm font-medium">Основные проекты</p>
                        <ul className="mt-3 space-y-4">
                          {job.projects.map((project) => (
                            <li key={`${project.name}-${project.url}`}>
                              <p className="font-medium">
                                {project.name}
                                {project.url ? (
                                  <>
                                    {" "}
                                    <a
                                      href={project.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="font-normal text-olive underline decoration-border underline-offset-4 hover:decoration-olive"
                                    >
                                      ({project.url.replace(/^https?:\/\//, "")})
                                    </a>
                                  </>
                                ) : null}
                              </p>
                              {project.description ? (
                                <p className="mt-1 text-[15px] leading-relaxed text-foreground/90">{project.description}</p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {resume.education.length ? (
        <section className="border-b border-border py-8">
          <h2 className="font-heading text-2xl tracking-tight">Образование</h2>
          <div className="mt-6 space-y-6">
            {resume.education.map((item, index) => (
              <div key={`${item.institution}-${item.year}-${index}`} className="grid gap-2 sm:grid-cols-[11rem_1fr]">
                <div className="text-sm text-muted-foreground">
                  {item.level ? <p>{item.level}</p> : null}
                  {item.year ? <p className="mt-1">{item.year}</p> : null}
                </div>
                <div>
                  <p className="font-heading text-xl tracking-tight">{item.institution}</p>
                  {item.city ? <p className="mt-1 text-sm text-muted-foreground">{item.city}</p> : null}
                  {item.note ? <p className="mt-2 text-[15px] text-muted-foreground">{item.note}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {(resume.skills.length || resume.languages.length || resume.driving.hasCar || resume.driving.categories) && (
        <section className="border-b border-border py-8">
          <h2 className="font-heading text-2xl tracking-tight">Навыки</h2>
          {resume.skills.length ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <li
                  key={skill}
                  className="border border-border bg-card px-3 py-1.5 text-sm text-foreground"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : null}
          {resume.languages.length ? (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">Знание языков</p>
              <ul className="mt-2 space-y-1 text-[15px]">
                {resume.languages.map((item) => (
                  <li key={`${item.name}-${item.level}`}>
                    {item.name}
                    {item.level ? ` — ${item.level}` : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {resume.driving.hasCar || resume.driving.categories ? (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">Опыт вождения</p>
              <div className="mt-2 space-y-1 text-[15px]">
                {resume.driving.hasCar ? <p>Имеется собственный автомобиль</p> : null}
                {resume.driving.categories ? <p>Права категории {resume.driving.categories}</p> : null}
              </div>
            </div>
          ) : null}
        </section>
      )}

      {resume.about ? (
        <section className="py-8">
          <h2 className="font-heading text-2xl tracking-tight">Обо мне</h2>
          <div className="mt-5">
            <Paragraphs text={resume.about} />
          </div>
        </section>
      ) : null}

      <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
        <p>
          {shortName}
          {updated ? ` · Резюме обновлено ${updated}` : null}
        </p>
        <p className="mt-4 print:hidden">
          <ResumePrintButton />
        </p>
      </footer>
    </article>
  );
}
