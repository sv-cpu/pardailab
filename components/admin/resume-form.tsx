"use client";

import { useMemo, useState } from "react";

import { saveResumeAction } from "@/app/admin/resume-actions";
import { AvatarField } from "@/components/admin/avatar-field";
import { BioField } from "@/components/admin/bio-field";
import {
  blankEducation,
  blankJob,
  blankResume,
  resumePublicUrl,
  sortJobsByDate,
  type Resume,
  type ResumeEducation,
  type ResumeInput,
  type ResumeJob,
  type ResumeLanguage,
  type ResumeProject,
} from "@/lib/resumes.shared";

import { ConfirmDelete } from "./delete-button";
import { Field, fieldClass } from "./ui";

type Draft = ResumeInput;

function linesToText(value: string[]) {
  return value.join("\n");
}

function textToLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-border pt-8">
      <h2 className="font-heading text-2xl tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="justify-self-start text-sm text-olive hover:text-olive-deep">
      {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-sm text-muted-foreground hover:text-foreground">
      Удалить
    </button>
  );
}

export function ResumeForm({
  resume,
  users,
  canAssignOwner,
}: {
  resume?: Resume;
  users: { slug: string; name: string }[];
  canAssignOwner: boolean;
}) {
  const initial = useMemo<Draft>(() => {
    if (!resume) return blankResume();
    return {
      person: resume.person,
      target: resume.target,
      experienceLabel: resume.experienceLabel,
      jobs: sortJobsByDate(resume.jobs),
      education: resume.education,
      skills: resume.skills,
      languages: resume.languages,
      driving: resume.driving,
      about: resume.about,
    };
  }, [resume]);
  const [draft, setDraft] = useState<Draft>(initial);
  const [ownerSlug, setOwnerSlug] = useState(resume?.ownerSlug ?? users[0]?.slug ?? "");
  const payload = useMemo(() => JSON.stringify(draft), [draft]);
  const publicUrl = resume ? resumePublicUrl(resume.token) : "";

  function patchPerson<K extends keyof Draft["person"]>(key: K, value: Draft["person"][K]) {
    setDraft((prev) => ({ ...prev, person: { ...prev.person, [key]: value } }));
  }

  function patchTarget<K extends keyof Draft["target"]>(key: K, value: Draft["target"][K]) {
    setDraft((prev) => ({ ...prev, target: { ...prev.target, [key]: value } }));
  }

  function patchJob(index: number, next: ResumeJob) {
    setDraft((prev) => ({ ...prev, jobs: prev.jobs.map((job, i) => (i === index ? next : job)) }));
  }

  function patchEducation(index: number, next: ResumeEducation) {
    setDraft((prev) => ({
      ...prev,
      education: prev.education.map((item, i) => (i === index ? next : item)),
    }));
  }

  function patchLanguage(index: number, next: ResumeLanguage) {
    setDraft((prev) => ({
      ...prev,
      languages: prev.languages.map((item, i) => (i === index ? next : item)),
    }));
  }

  function patchProject(jobIndex: number, projectIndex: number, next: ResumeProject) {
    setDraft((prev) => ({
      ...prev,
      jobs: prev.jobs.map((job, i) =>
        i === jobIndex
          ? { ...job, projects: job.projects.map((project, j) => (j === projectIndex ? next : project)) }
          : job,
      ),
    }));
  }

  return (
    <form action={saveResumeAction} encType="multipart/form-data" className="grid max-w-3xl gap-8">
      <input type="hidden" name="id" value={resume?.id ?? ""} />
      <input type="hidden" name="payload" value={payload} />
      {canAssignOwner ? <input type="hidden" name="ownerSlug" value={ownerSlug} /> : null}

      {resume ? (
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <p className="text-muted-foreground">Закрытая ссылка (не публикуется в меню и sitemap)</p>
          <p className="mt-2 break-all font-mono text-xs text-foreground">{publicUrl}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              className="text-sm text-olive hover:text-olive-deep"
              onClick={() => navigator.clipboard.writeText(publicUrl)}
            >
              Копировать ссылку
            </button>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="text-sm text-olive hover:text-olive-deep">
              Открыть
            </a>
            <button type="submit" name="intent" value="rotate" className="text-sm text-muted-foreground hover:text-foreground">
              Обновить ссылку
            </button>
          </div>
        </div>
      ) : null}

      <Section title="Личные данные">
        <AvatarField photo={resume?.photo} fallback={draft.person.fullName || "Р"} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ФИО">
            <input
              value={draft.person.fullName}
              onChange={(e) => patchPerson("fullName", e.target.value)}
              required
              className={fieldClass}
            />
          </Field>
          <Field label="Пол">
            <input value={draft.person.gender} onChange={(e) => patchPerson("gender", e.target.value)} className={fieldClass} />
          </Field>
          <Field label="Дата рождения">
            <input
              type="date"
              value={draft.person.birthDate}
              onChange={(e) => patchPerson("birthDate", e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Город">
            <input value={draft.person.city} onChange={(e) => patchPerson("city", e.target.value)} className={fieldClass} />
          </Field>
          <Field label="Телефон">
            <input value={draft.person.phone} onChange={(e) => patchPerson("phone", e.target.value)} className={fieldClass} />
          </Field>
          <Field label="Пометка к телефону">
            <input
              value={draft.person.phoneNote}
              onChange={(e) => patchPerson("phoneNote", e.target.value)}
              placeholder="предпочитаемый способ связи"
              className={fieldClass}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={draft.person.email}
              onChange={(e) => patchPerson("email", e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Гражданство">
            <input
              value={draft.person.citizenship}
              onChange={(e) => patchPerson("citizenship", e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Разрешение на работу">
            <input
              value={draft.person.workPermit}
              onChange={(e) => patchPerson("workPermit", e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Переезд">
            <input
              value={draft.person.relocation}
              onChange={(e) => patchPerson("relocation", e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Командировки">
            <input
              value={draft.person.businessTrips}
              onChange={(e) => patchPerson("businessTrips", e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="О себе">
        <BioField
          key={resume?.id ?? "new-about"}
          initial={draft.about}
          label=""
          name="aboutHtml"
          onChange={(about) => setDraft((prev) => ({ ...prev, about }))}
        />
      </Section>

      <Section title="Желаемая должность">
        <Field label="Должность">
          <textarea
            value={draft.target.title}
            onChange={(e) => patchTarget("title", e.target.value)}
            rows={2}
            className={fieldClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Тип занятости">
            <input
              value={draft.target.employmentType}
              onChange={(e) => patchTarget("employmentType", e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Формат работы">
            <input
              value={draft.target.workFormat}
              onChange={(e) => patchTarget("workFormat", e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Время в пути">
            <input value={draft.target.commute} onChange={(e) => patchTarget("commute", e.target.value)} className={fieldClass} />
          </Field>
          <Field label="Зарплата">
            <input value={draft.target.salary} onChange={(e) => patchTarget("salary", e.target.value)} className={fieldClass} />
          </Field>
          <Field label="Опыт работы (подпись)">
            <input
              value={draft.experienceLabel}
              onChange={(e) => setDraft((prev) => ({ ...prev, experienceLabel: e.target.value }))}
              placeholder="3 года 9 месяцев"
              className={fieldClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Опыт работы">
        <p className="text-sm text-muted-foreground">На странице резюме места идут от новых к старым по дате начала.</p>
        {draft.jobs.map((job, index) => (
          <div key={index} className="grid gap-4 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-heading text-lg">Место {index + 1}</p>
              <RemoveButton
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    jobs: prev.jobs.length > 1 ? prev.jobs.filter((_, i) => i !== index) : [blankJob()],
                  }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Начало">
                <input
                  type="month"
                  value={job.start}
                  onChange={(e) => patchJob(index, { ...job, start: e.target.value })}
                  className={fieldClass}
                />
              </Field>
              <div className="grid gap-2">
                <Field label="Окончание">
                  <input
                    type="month"
                    value={job.end}
                    disabled={!job.end}
                    onChange={(e) => patchJob(index, { ...job, end: e.target.value })}
                    className={fieldClass}
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={!job.end}
                    onChange={(e) =>
                      patchJob(index, {
                        ...job,
                        end: e.target.checked ? "" : job.end || job.start || new Date().toISOString().slice(0, 7),
                      })
                    }
                  />
                  По настоящее время
                </label>
              </div>
              <Field label="Компания">
                <input
                  value={job.company}
                  onChange={(e) => patchJob(index, { ...job, company: e.target.value })}
                  className={fieldClass}
                />
              </Field>
              <Field label="Город">
                <input value={job.city} onChange={(e) => patchJob(index, { ...job, city: e.target.value })} className={fieldClass} />
              </Field>
              <Field label="Отрасль">
                <input
                  value={job.industry}
                  onChange={(e) => patchJob(index, { ...job, industry: e.target.value })}
                  className={fieldClass}
                />
              </Field>
              <Field label="Должность">
                <input
                  value={job.position}
                  onChange={(e) => patchJob(index, { ...job, position: e.target.value })}
                  className={fieldClass}
                />
              </Field>
            </div>
            <BioField
              key={`job-summary-${index}-${job.start}-${job.company}`}
              initial={job.summary}
              label="Описание"
              name={`job-summary-${index}`}
              onChange={(summary) => patchJob(index, { ...job, summary })}
            />
            <div className="grid gap-3">
              <p className="text-sm text-muted-foreground">Проекты</p>
              {job.projects.map((project, projectIndex) => (
                <div key={projectIndex} className="grid gap-3 border border-border p-3">
                  <div className="flex justify-end">
                    <RemoveButton
                      onClick={() =>
                        patchJob(index, {
                          ...job,
                          projects: job.projects.filter((_, i) => i !== projectIndex),
                        })
                      }
                    />
                  </div>
                  <Field label="Название">
                    <input
                      value={project.name}
                      onChange={(e) => patchProject(index, projectIndex, { ...project, name: e.target.value })}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="URL">
                    <input
                      value={project.url}
                      onChange={(e) => patchProject(index, projectIndex, { ...project, url: e.target.value })}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Описание">
                    <textarea
                      value={project.description}
                      onChange={(e) =>
                        patchProject(index, projectIndex, { ...project, description: e.target.value })
                      }
                      rows={3}
                      className={fieldClass}
                    />
                  </Field>
                </div>
              ))}
              <AddButton
                label="Добавить проект"
                onClick={() =>
                  patchJob(index, {
                    ...job,
                    projects: [...job.projects, { name: "", url: "", description: "" }],
                  })
                }
              />
            </div>
          </div>
        ))}
        <AddButton label="Добавить место работы" onClick={() => setDraft((prev) => ({ ...prev, jobs: [...prev.jobs, blankJob()] }))} />
      </Section>

      <Section title="Образование">
        {draft.education.map((item, index) => (
          <div key={index} className="grid gap-4 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <p className="font-heading text-lg">Запись {index + 1}</p>
              <RemoveButton
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    education:
                      prev.education.length > 1 ? prev.education.filter((_, i) => i !== index) : [blankEducation()],
                  }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Год">
                <input
                  value={item.year}
                  onChange={(e) => patchEducation(index, { ...item, year: e.target.value })}
                  className={fieldClass}
                />
              </Field>
              <Field label="Уровень">
                <input
                  value={item.level}
                  onChange={(e) => patchEducation(index, { ...item, level: e.target.value })}
                  className={fieldClass}
                />
              </Field>
              <Field label="Учебное заведение">
                <input
                  value={item.institution}
                  onChange={(e) => patchEducation(index, { ...item, institution: e.target.value })}
                  className={fieldClass}
                />
              </Field>
              <Field label="Город">
                <input
                  value={item.city}
                  onChange={(e) => patchEducation(index, { ...item, city: e.target.value })}
                  className={fieldClass}
                />
              </Field>
              <Field label="Примечание">
                <input
                  value={item.note}
                  onChange={(e) => patchEducation(index, { ...item, note: e.target.value })}
                  className={fieldClass}
                />
              </Field>
            </div>
          </div>
        ))}
        <AddButton
          label="Добавить образование"
          onClick={() => setDraft((prev) => ({ ...prev, education: [...prev.education, blankEducation()] }))}
        />
      </Section>

      <Section title="Навыки и языки">
        <Field label="Навыки (по строке)">
          <textarea
            value={linesToText(draft.skills)}
            onChange={(e) => setDraft((prev) => ({ ...prev, skills: textToLines(e.target.value) }))}
            rows={5}
            className={fieldClass}
          />
        </Field>
        {draft.languages.map((item, index) => (
          <div key={index} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <Field label="Язык">
              <input
                value={item.name}
                onChange={(e) => patchLanguage(index, { ...item, name: e.target.value })}
                className={fieldClass}
              />
            </Field>
            <Field label="Уровень">
              <input
                value={item.level}
                onChange={(e) => patchLanguage(index, { ...item, level: e.target.value })}
                className={fieldClass}
              />
            </Field>
            <div className="flex items-end pb-2">
              <RemoveButton
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    languages: prev.languages.filter((_, i) => i !== index),
                  }))
                }
              />
            </div>
          </div>
        ))}
        <AddButton
          label="Добавить язык"
          onClick={() => setDraft((prev) => ({ ...prev, languages: [...prev.languages, { name: "", level: "" }] }))}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.driving.hasCar}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, driving: { ...prev.driving, hasCar: e.target.checked } }))
              }
            />
            Есть собственный автомобиль
          </label>
          <Field label="Категории прав">
            <input
              value={draft.driving.categories}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, driving: { ...prev.driving, categories: e.target.value } }))
              }
              className={fieldClass}
            />
          </Field>
        </div>
      </Section>

      {canAssignOwner ? (
        <Section title="Владелец">
          <Field label="Сотрудник">
            <select value={ownerSlug} onChange={(e) => setOwnerSlug(e.target.value)} className={fieldClass}>
              {users.map((user) => (
                <option key={user.slug} value={user.slug}>
                  {user.name}
                </option>
              ))}
            </select>
          </Field>
        </Section>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button
          type="submit"
          name="intent"
          value="save"
          className="rounded-full bg-olive px-5 py-2.5 text-sm text-accent-foreground hover:bg-olive-deep"
        >
          Сохранить
        </button>
        {resume ? <ConfirmDelete /> : null}
      </div>
    </form>
  );
}
