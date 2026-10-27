import { randomBytes, randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

import { getDb } from "@/lib/db";
import { site } from "@/lib/site";
import type { StaffUser } from "@/lib/users";

export interface ResumeProject {
  name: string;
  url: string;
  description: string;
}

export interface ResumeJob {
  start: string;
  end: string;
  company: string;
  city: string;
  industry: string;
  position: string;
  summary: string;
  duties: string[];
  competencies: string[];
  projects: ResumeProject[];
}

export interface ResumeEducation {
  year: string;
  level: string;
  institution: string;
  city: string;
  note: string;
}

export interface ResumeLanguage {
  name: string;
  level: string;
}

export interface ResumePerson {
  fullName: string;
  gender: string;
  birthDate: string;
  phone: string;
  phoneNote: string;
  email: string;
  city: string;
  citizenship: string;
  workPermit: string;
  relocation: string;
  businessTrips: string;
}

export interface ResumeTarget {
  title: string;
  specializations: string[];
  employmentType: string;
  workFormat: string;
  commute: string;
  salary: string;
}

export interface ResumeDriving {
  hasCar: boolean;
  categories: string;
}

export interface Resume {
  id: string;
  token: string;
  ownerSlug: string;
  updatedAt: string;
  person: ResumePerson;
  target: ResumeTarget;
  experienceLabel: string;
  jobs: ResumeJob[];
  education: ResumeEducation[];
  skills: string[];
  languages: ResumeLanguage[];
  driving: ResumeDriving;
  about: string;
}

export type ResumeInput = Omit<Resume, "id" | "token" | "ownerSlug" | "updatedAt"> & {
  id?: string;
  token?: string;
  ownerSlug?: string;
  updatedAt?: string;
};

const MONTHS_RU = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

function blankPerson(): ResumePerson {
  return {
    fullName: "",
    gender: "",
    birthDate: "",
    phone: "",
    phoneNote: "",
    email: "",
    city: "",
    citizenship: "",
    workPermit: "",
    relocation: "",
    businessTrips: "",
  };
}

function blankTarget(): ResumeTarget {
  return {
    title: "",
    specializations: [],
    employmentType: "",
    workFormat: "",
    commute: "",
    salary: "",
  };
}

export function blankJob(): ResumeJob {
  return {
    start: "",
    end: "",
    company: "",
    city: "",
    industry: "",
    position: "",
    summary: "",
    duties: [],
    competencies: [],
    projects: [],
  };
}

export function blankEducation(): ResumeEducation {
  return { year: "", level: "", institution: "", city: "", note: "" };
}

export function blankResume(): ResumeInput {
  return {
    person: blankPerson(),
    target: blankTarget(),
    experienceLabel: "",
    jobs: [blankJob()],
    education: [blankEducation()],
    skills: [],
    languages: [{ name: "Русский", level: "Родной" }],
    driving: { hasCar: false, categories: "" },
    about: "",
  };
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n|;/)
      .map((item) => item.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean);
  }
  return [];
}

function asProjects(value: unknown): ResumeProject[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const row = asObject(item);
      return {
        name: asString(row.name),
        url: asString(row.url),
        description: asString(row.description),
      };
    })
    .filter((item) => item.name || item.url || item.description);
}

function asJobs(value: unknown): ResumeJob[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = asObject(item);
    return {
      start: asString(row.start),
      end: asString(row.end),
      company: asString(row.company),
      city: asString(row.city),
      industry: asString(row.industry),
      position: asString(row.position),
      summary: asString(row.summary),
      duties: asLines(row.duties),
      competencies: asLines(row.competencies),
      projects: asProjects(row.projects),
    };
  });
}

function asEducation(value: unknown): ResumeEducation[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = asObject(item);
    return {
      year: asString(row.year),
      level: asString(row.level),
      institution: asString(row.institution),
      city: asString(row.city),
      note: asString(row.note),
    };
  });
}

function asLanguages(value: unknown): ResumeLanguage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const row = asObject(item);
      return { name: asString(row.name), level: asString(row.level) };
    })
    .filter((item) => item.name);
}

export function normalizeResume(input: unknown, fallback?: Partial<Resume>): Resume {
  const raw = asObject(input);
  const personRaw = asObject(raw.person);
  const targetRaw = asObject(raw.target);
  const drivingRaw = asObject(raw.driving);
  const id = asString(raw.id) || fallback?.id || randomUUID();
  const token = asString(raw.token) || fallback?.token || createResumeToken();
  const ownerSlug = asString(raw.ownerSlug) || fallback?.ownerSlug || "";
  if (!ownerSlug) throw new Error("Укажите владельца резюме.");
  const person: ResumePerson = {
    fullName: asString(personRaw.fullName) || fallback?.person?.fullName || "",
    gender: asString(personRaw.gender),
    birthDate: asString(personRaw.birthDate),
    phone: asString(personRaw.phone),
    phoneNote: asString(personRaw.phoneNote),
    email: asString(personRaw.email),
    city: asString(personRaw.city),
    citizenship: asString(personRaw.citizenship),
    workPermit: asString(personRaw.workPermit),
    relocation: asString(personRaw.relocation),
    businessTrips: asString(personRaw.businessTrips),
  };
  if (!person.fullName) throw new Error("Укажите ФИО.");
  const target: ResumeTarget = {
    title: asString(targetRaw.title),
    specializations: asLines(targetRaw.specializations),
    employmentType: asString(targetRaw.employmentType),
    workFormat: asString(targetRaw.workFormat),
    commute: asString(targetRaw.commute),
    salary: asString(targetRaw.salary),
  };
  return {
    id,
    token,
    ownerSlug,
    updatedAt: asString(raw.updatedAt) || fallback?.updatedAt || new Date().toISOString(),
    person,
    target,
    experienceLabel: asString(raw.experienceLabel),
    jobs: asJobs(raw.jobs),
    education: asEducation(raw.education),
    skills: asLines(raw.skills),
    languages: asLanguages(raw.languages),
    driving: {
      hasCar: Boolean(drivingRaw.hasCar ?? fallback?.driving?.hasCar),
      categories: asString(drivingRaw.categories),
    },
    about: asString(raw.about),
  };
}

export function createResumeToken() {
  return randomBytes(24).toString("base64url");
}

export function resumePublicPath(token: string) {
  return `/r/${token}`;
}

export function resumePublicUrl(token: string) {
  return new URL(resumePublicPath(token), site.url).toString();
}

export function ensureResumes(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      payload TEXT NOT NULL
    );
  `);
}

function writeResume(resume: Resume, db: DatabaseSync) {
  ensureResumes(db);
  db.prepare(
    `INSERT INTO resumes (id, token, payload) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET token = excluded.token, payload = excluded.payload`,
  ).run(resume.id, resume.token, JSON.stringify(resume));
}

export function listResumes(db = getDb()): Resume[] {
  ensureResumes(db);
  const rows = db.prepare("SELECT payload FROM resumes").all() as { payload: string }[];
  return rows
    .map((row) => normalizeResume(JSON.parse(row.payload)))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.person.fullName.localeCompare(b.person.fullName, "ru"));
}

export function listResumesFor(actor: StaffUser, db = getDb()) {
  const all = listResumes(db);
  if (actor.role === "editor") return all;
  return all.filter((item) => item.ownerSlug === actor.slug);
}

export function findResumeById(id: string, db = getDb()) {
  return listResumes(db).find((item) => item.id === id) ?? null;
}

export function findResumeByToken(token: string, db = getDb()) {
  ensureResumes(db);
  const row = db.prepare("SELECT payload FROM resumes WHERE token = ?").get(token) as { payload: string } | undefined;
  if (!row) return null;
  return normalizeResume(JSON.parse(row.payload));
}

export function canManageResume(resume: Resume, actor: StaffUser) {
  return actor.role === "editor" || resume.ownerSlug === actor.slug;
}

export function createResume(input: ResumeInput, ownerSlug: string, db = getDb()) {
  const resume = normalizeResume(
    { ...input, id: randomUUID(), token: createResumeToken(), ownerSlug, updatedAt: new Date().toISOString() },
    { ownerSlug },
  );
  writeResume(resume, db);
  return resume;
}

export function updateResume(id: string, input: ResumeInput & { ownerSlug?: string }, db = getDb()) {
  const current = findResumeById(id, db);
  if (!current) throw new Error("Резюме не найдено.");
  const resume = normalizeResume(
    {
      ...input,
      id: current.id,
      token: current.token,
      ownerSlug: input.ownerSlug || current.ownerSlug,
      updatedAt: new Date().toISOString(),
    },
    current,
  );
  writeResume(resume, db);
  return resume;
}

export function rotateResumeToken(id: string, db = getDb()) {
  const current = findResumeById(id, db);
  if (!current) throw new Error("Резюме не найдено.");
  const next = { ...current, token: createResumeToken(), updatedAt: new Date().toISOString() };
  writeResume(next, db);
  return next;
}

export function deleteResume(id: string, db = getDb()) {
  ensureResumes(db);
  db.prepare("DELETE FROM resumes WHERE id = ?").run(id);
}

export function parseResumePayload(raw: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Не удалось прочитать данные формы.");
  }
  return normalizeResume(parsed, { ownerSlug: "pending" });
}

/** Age in full years from YYYY-MM-DD, or null. */
export function ageFromBirthDate(birthDate: string, now = new Date()) {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  let age = now.getFullYear() - year;
  const beforeBirthday = now.getMonth() + 1 < month || (now.getMonth() + 1 === month && now.getDate() < day);
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
}

export function formatBirthLine(person: ResumePerson, now = new Date()) {
  const parts: string[] = [];
  if (person.gender) parts.push(person.gender);
  const age = ageFromBirthDate(person.birthDate, now);
  if (age !== null) parts.push(`${age} ${pluralYears(age)}`);
  const born = formatDayMonthYear(person.birthDate);
  if (born) parts.push(`родился ${born}`);
  return parts.join(", ");
}

export function formatDayMonthYear(iso: string) {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const day = Number(match[3]);
  const month = Number(match[2]);
  const year = match[1];
  if (month < 1 || month > 12) return "";
  return `${day} ${MONTHS_RU[month - 1]} ${year}`;
}

export function formatMonthYear(value: string) {
  if (!value) return "настоящее время";
  const match = value.match(/^(\d{4})-(\d{2})/);
  if (!match) return value;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return value;
  return `${MONTH_NAMES[month - 1]} ${match[1]}`;
}

export function formatJobPeriod(job: ResumeJob) {
  return `${formatMonthYear(job.start)} — ${job.end ? formatMonthYear(job.end) : "настоящее время"}`;
}

export function monthsBetween(start: string, end: string | null, now = new Date()) {
  const startMatch = start.match(/^(\d{4})-(\d{2})/);
  if (!startMatch) return null;
  const endMatch = end?.match(/^(\d{4})-(\d{2})/);
  const startYear = Number(startMatch[1]);
  const startMonth = Number(startMatch[2]);
  const endYear = endMatch ? Number(endMatch[1]) : now.getFullYear();
  const endMonth = endMatch ? Number(endMatch[2]) : now.getMonth() + 1;
  const total = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  return total > 0 ? total : null;
}

export function formatDurationMonths(months: number) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} ${pluralYears(years)}`);
  if (rest || !years) parts.push(`${rest} ${pluralMonths(rest)}`);
  return parts.join(" ");
}

export function formatJobDuration(job: ResumeJob, now = new Date()) {
  const months = monthsBetween(job.start, job.end || null, now);
  return months === null ? "" : formatDurationMonths(months);
}

export function formatUpdatedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const monthName = get("month");
  return `${get("day")} ${monthName} ${get("year")} в ${get("hour")}:${get("minute")}`;
}

function pluralYears(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "год";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "года";
  return "лет";
}

function pluralMonths(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "месяц";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "месяца";
  return "месяцев";
}

export function sampleResumeInput(): ResumeInput {
  return {
    person: {
      fullName: "Вихарев Сергей Владимирович",
      gender: "Мужчина",
      birthDate: "1975-02-06",
      phone: "+7 (986) 011-48-45",
      phoneNote: "предпочитаемый способ связи",
      email: "pardus.sv@yandex.ru",
      city: "Москва",
      citizenship: "Россия",
      workPermit: "Россия",
      relocation: "Не готов к переезду",
      businessTrips: "готов к командировкам",
    },
    target: {
      title: "Руководитель проектов в области БПЛА / БАС / Информационных систем",
      specializations: ["Руководитель группы разработки", "Руководитель проектов"],
      employmentType: "полная занятость",
      workFormat: "на месте работодателя",
      commute: "не имеет значения",
      salary: "",
    },
    experienceLabel: "3 года 9 месяцев",
    jobs: [
      {
        start: "2026-07",
        end: "",
        company: "АО «НПО РусБИТех»",
        city: "Москва",
        industry: "",
        position: "Руководитель группы испытателей перехватчиков БПЛА",
        summary:
          "Руковожу группой, осуществляющей испытания беспилотных летательных аппаратов-перехватчиков и разработку методик их применения. Организую полный цикл испытаний: от подготовки полётных заданий и оценки готовности опытных образцов до анализа результатов и выработки рекомендаций по доработке конструкции, программного обеспечения и алгоритмов управления.",
        duties: [
          "организация и руководство работой группы пилотов-испытателей",
          "планирование и проведение лётных испытаний опытных образцов",
          "разработка программ и методик испытаний",
          "оценка лётных характеристик, надёжности и эффективности перехватчиков",
          "анализ результатов испытаний и подготовка технических заключений",
          "взаимодействие с конструкторами, разработчиками программного обеспечения и производственными подразделениями",
          "разработка требований к эксплуатации, безопасности и подготовке операторов",
          "участие в совершенствовании алгоритмов управления, навигации и применения беспилотных систем",
        ],
        competencies: [
          "руководство инженерными и испытательными командами",
          "организация лётных испытаний БПЛА",
          "разработка методик испытаний",
          "анализ лётных данных и оценка эффективности",
          "управление рисками и обеспечение безопасности испытаний",
          "взаимодействие с разработчиками аппаратного и программного обеспечения",
          "подготовка технической документации и отчётности",
        ],
        projects: [],
      },
      {
        start: "2024-11",
        end: "",
        company: "PardAiLab",
        city: "",
        industry: "",
        position: "Руководитель проектов",
        summary:
          "Руководство разработкой программных платформ, систем искусственного интеллекта и цифровых продуктов для беспилотных технологий, промышленности и автоматизации. Архитектура сложных информационных систем, создание мультиагентных AI-платформ, сервисов поддержки принятия решений, платформ управления знаниями и специализированных инженерных решений.",
        duties: [],
        competencies: [],
        projects: [
          {
            name: "PardAi.ru",
            url: "https://pardai.ru",
            description:
              "Экосистема сервисов искусственного интеллекта для бизнеса и инженерных задач. Разработка AI-агентов, инструментов автоматизации, генеративных сервисов, систем анализа документов и платформ коллективной работы с корпоративными знаниями.",
          },
          {
            name: "PardMind",
            url: "https://pardmind.ru",
            description:
              "Платформа управления знаниями и мультиагентная AI-система. Реализация корпоративного поиска, RAG, интеллектуальной обработки документов, экспертных агентов и автоматизации бизнес-процессов.",
          },
          {
            name: "ВЗЛЁТ",
            url: "https://vzlet.pardai.ru",
            description:
              "Единая цифровая платформа для пилотов беспилотных летательных аппаратов. Инструменты подготовки полетов, погодного анализа, инженерных расчетов, ведения журналов полетов и поддержки эксплуатации БПЛА.",
          },
          {
            name: "PardCom",
            url: "https://vzlet.pardai.ru/demo",
            description:
              "Программная платформа управления подразделениями беспилотных систем. Координация операторов, обмен информацией, ситуационная осведомленность и поддержка принятия решений.",
          },
          {
            name: "Marketplace Monitor",
            url: "http://amm.asgardai.ru",
            description:
              "SaaS-платформа мониторинга маркетплейсов с использованием искусственного интеллекта. Анализ цен, конкурентов, ассортимента и автоматизация управления продажами.",
          },
          {
            name: "KartinAI",
            url: "https://kartinai.ru/",
            description:
              "Платформа генерации изображений, видео и маркетингового контента на базе современных генеративных моделей.",
          },
          {
            name: "«Технологии Победы»",
            url: "https://tech-victory.ru",
            description:
              "Информационно-аналитический портал о беспилотных технологиях, робототехнике и искусственном интеллекте. Разработка AI-сервисов для мониторинга открытых источников, анализа информации и подготовки отраслевой аналитики.",
          },
        ],
      },
      {
        start: "2024-05",
        end: "2024-10",
        company: "АНО «Технологии Победы»",
        city: "Нижний Новгород",
        industry: "Государственные организации",
        position: "Директор",
        summary:
          "Руководство полным циклом создания и масштабирования организации в сфере БПЛА. Осуществлял стратегическое и оперативное управление развитием компании: выстраивал эффективные коммуникации между профильными подразделениями для консолидации и систематизации потребностей заказчиков. На основе собранных данных формировал технические задания и координировал процессы на всех этапах жизненного цикла продукции — от НИОКР и инженерных испытаний до серийного производства беспилотных авиационных систем. Особое внимание уделял развитию кооперации: наладил устойчивое взаимодействие между производственным сектором и курируемыми потребителями, обеспечив обратную связь по эксплуатации и оперативную доработку изделий под актуальные задачи.",
        duties: [],
        competencies: [],
        projects: [],
      },
      {
        start: "2023-08",
        end: "2024-05",
        company: "БПЛА Батальон",
        city: "Луганск",
        industry: "Государственные организации",
        position: "Заместитель командира батальона",
        summary:
          "Опыт управления тактическими и оперативными подразделениями. Прошел восходящую карьерную траекторию от руководителя малой группы до заместителя начальника крупного подразделения по оперативной работе. Обеспечивал координацию взаимодействия между смежными группами и фронтальными подразделениями, организовывал комплексное ресурсное и логистическое сопровождение ударных оперативных групп в условиях жестких временных ограничений.\n\nКлючевые проектные достижения:\nСоздание аналитического отдела с нуля: разработал и внедрил структуру нового подразделения аналитики при штабе. Настроил процессы сбора, верификации и визуализации больших объемов полевых данных. Это позволило сократить время на принятие управленческих решений и повысить точность планирования для вышестоящего руководства.\nЗапуск нового технологического направления (БПЛА): инициировал и реализовал проект по созданию профильного подразделения беспилотных систем. Организовал полный цикл: от выбора оборудования и разработки регламентов до обучения личного состава и интеграции новой технологии в существующие операционные процессы.\nНагражден государственными наградами.",
        duties: [],
        competencies: [],
        projects: [],
      },
      {
        start: "2022-10",
        end: "2023-03",
        company: "АНО «Сталь»",
        city: "Нижний Новгород",
        industry: "",
        position: "Командир учебного центра специальной подготовки",
        summary:
          "Создал учебный центр практически с нуля. Организовал строительство и материально-техническое обеспечение. Сформировал инструкторский состав. Разработал программы подготовки. Создал филиал центра подготовки специалистов БПЛА в действующей танковой дивизии.",
        duties: [],
        competencies: [],
        projects: [],
      },
      {
        start: "2022-10",
        end: "2023-01",
        company: "ЧВК Вагнер",
        city: "Луганск",
        industry: "",
        position: "Артразведчик",
        summary:
          "Участвовал в Специальной военной операции. Выполнял обязанности по разведке, целеуказанию и корректировке артиллерийских установок. Ранен в январе 2023 года, находился на излечении до конца контракта. Награжден государственными и ведомственными наградами.",
        duties: [],
        competencies: [],
        projects: [],
      },
    ],
    education: [
      {
        year: "2005",
        level: "Высшее",
        institution: "Уральский институт бизнеса",
        city: "Челябинск",
        note: "диплом не получен",
      },
    ],
    skills: [
      "Организация разработки и производства БПЛА",
      "Управление полным жизненным циклом изделия",
      "Производственный менеджмент",
      "Архитектура AI-сервисов",
    ],
    languages: [{ name: "Русский", level: "Родной" }],
    driving: { hasCar: true, categories: "B" },
    about:
      "Более 20 лет занимаюсь созданием, развитием и управлением сложными организационно-техническими системами. Имею практический опыт организации серийного производства БПЛА, создания подразделений беспилотной авиации, управления инженерными командами, формирования технических заданий, проведения испытаний и вывода новых изделий в эксплуатацию.\n\nПоследние годы специализируюсь на развитии беспилотных авиационных систем и применении технологий искусственного интеллекта для повышения эффективности разработки, производства и эксплуатации БАС. Рассматриваю AI как ключевой элемент следующего поколения беспилотных систем — от интеллектуальной обработки данных и автоматизации принятия решений до создания цифровых сервисов сопровождения и аналитических платформ.\n\nМоя сильная сторона — создание новых технологических направлений с нуля: формирование команды, организация процессов, выстраивание взаимодействия между заказчиком, разработчиками и производством, доведение сложных проектов до промышленной эксплуатации.",
  };
}
