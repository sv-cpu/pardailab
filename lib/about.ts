import { getDb } from "@/lib/db";
import {
  aboutDirectionSlugs,
  ensureAboutHtml,
  type AboutDevelopment,
  type AboutDirection,
  type AboutDirectionSlug,
  type AboutLab,
  type AboutProject,
} from "@/lib/about.shared";
import { isStoredCover } from "@/lib/covers";
import { sanitizeArticleHtml } from "@/lib/html";

export {
  aboutDirectionHref,
  aboutDirectionSlugs,
  aboutParagraphs,
  ensureAboutHtml,
  type AboutDevelopment,
  type AboutDirection,
  type AboutDirectionSlug,
  type AboutLab,
  type AboutProject,
} from "@/lib/about.shared";

const META_KEY = "about_lab";
const HTML_MAX = 200_000;

function p(...parts: string[]) {
  return parts.map((part) => `<p>${part}</p>`).join("\n");
}

export const defaultAboutLab = (): AboutLab => ({
  eyebrow: "Лаборатория",
  title: "PardAiLab",
  lede: "Независимая AI-инжиниринговая лаборатория.",
  slogan: "Дальше — машины. Выше — люди.",
  body: p(
    "Мы исследуем возможности искусственного интеллекта, разрабатываем интеллектуальные программные и аппаратные решения, реализуем собственные проекты и внедряем AI-технологии в реальные задачи.",
    "Наша цель — создавать технологии, которые приносят практическую пользу людям, бизнесу и государству.",
  ),
  methodTitle: "Как устроена работа",
  methodBody: p(
    "Работа лаборатории строится вокруг четырёх направлений: исследования, разработки, проекты и медиа. Каждое направление опирается на практику, а не на пересказ чужих заявлений.",
    "Мы публикуем то, что сами проверили или сделали. Граница выборки, ограничения и результат формулируются прямо — без рекламной подачи.",
  ),
  contactTitle: "Связаться с лабораторией",
  contactLede: "Задача на исследование, разработку, внедрение или партнёрство.",
  projects: [],
  developments: [],
  directions: [
    {
      slug: "issledovaniya",
      title: "Исследования",
      teaser: "Изучение и объективная оценка технологий искусственного интеллекта.",
      lede: "Проверяем заявления вендоров и возможности моделей на реальных задачах.",
      body: p(
        "Исследования лаборатории нужны, чтобы отделить рабочий инструмент от рекламного обещания.",
        "Мы задаём тему, фиксируем границу выборки и публикуем результат так, чтобы его можно было прочитать и оспорить по делу.",
      ),
    },
    {
      slug: "razrabotki",
      title: "Разработки",
      teaser: "Программные продукты, AI-агенты, интеллектуальные устройства и инженерные решения.",
      lede: "Создаём программные и аппаратные системы, которые решают конкретную задачу.",
      body: p(
        "Разработки лаборатории включают программные продукты, AI-агентов, интеллектуальные устройства и инженерные контуры.",
        "Мы проектируем решение от задачи: что должно работать в руках человека, где нужна автоматизация и где ответственность остаётся за оператором.",
      ),
    },
    {
      slug: "proekty",
      title: "Проекты",
      teaser: "Применение собственных технологий в реальных задачах и создание новых продуктов.",
      lede: "Выносим технологии из стенда в рабочий процесс.",
      body: p(
        "Проекты — это применение собственных технологий в реальных задачах: у людей, в бизнесе и в государственных процессах.",
        "Здесь лаборатория отвечает не только за идею, но и за внедрение, сопровождение и измеряемый результат.",
      ),
    },
    {
      slug: "media",
      title: "Медиа",
      teaser: "Открытая публикация исследований, разработок, аналитики и опыта применения ИИ.",
      lede: "Делимся тем, что проверили и сделали сами.",
      body: p(
        "Медиа-контур лаборатории — это открытая публикация исследований, разработок, аналитики и опыта применения искусственного интеллекта.",
        "Портал PardAiLab существует не вместо инженерии, а рядом с ней: чтобы читатель видел метод, ограничения и практический вывод.",
      ),
    },
  ],
});

function isDirectionSlug(value: string): value is AboutDirectionSlug {
  return (aboutDirectionSlugs as readonly string[]).includes(value);
}

function cleanText(value: unknown, max = 20_000) {
  return String(value ?? "")
    .replace(/\0/g, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}

function cleanHtml(value: unknown, fallback: string) {
  const raw = String(value ?? "")
    .replace(/\0/g, "")
    .slice(0, HTML_MAX)
    .trim();
  if (!raw) return fallback;
  const cleaned = sanitizeArticleHtml(ensureAboutHtml(raw)).trim();
  return cleaned || fallback;
}

function mergeDirection(base: AboutDirection, raw: Partial<AboutDirection> | undefined): AboutDirection {
  if (!raw) return base;
  return {
    slug: base.slug,
    title: cleanText(raw.title, 120) || base.title,
    teaser: cleanText(raw.teaser, 400) || base.teaser,
    lede: cleanText(raw.lede, 600) || base.lede,
    body: cleanHtml(raw.body, base.body),
    image: typeof raw.image === "string" && raw.image ? raw.image : undefined,
  };
}

function cleanProjectUrl(value: unknown) {
  const raw = cleanText(value, 500);
  if (!raw) return undefined;
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") return raw;
  } catch {
    return undefined;
  }
  return undefined;
}

export function normalizeProject(raw: Partial<AboutProject> | null | undefined): AboutProject | null {
  if (!raw) return null;
  const id = cleanText(raw.id, 80);
  const title = cleanText(raw.title, 160);
  const description = cleanText(raw.description, 4000);
  const cover = cleanText(raw.cover, 300);
  if (!id || !title || !description || !cover || !isStoredCover(cover)) return null;
  const url = cleanProjectUrl(raw.url);
  return { id, title, description, cover, ...(url ? { url } : {}) };
}

export function normalizeProjects(raw: unknown): AboutProject[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const projects: AboutProject[] = [];
  for (const item of raw) {
    const project = normalizeProject(item as Partial<AboutProject>);
    if (!project || seen.has(project.id)) continue;
    seen.add(project.id);
    projects.push(project);
    if (projects.length >= 48) break;
  }
  return projects;
}

export function normalizeDevelopment(raw: Partial<AboutDevelopment> | null | undefined): AboutDevelopment | null {
  if (!raw) return null;
  const id = cleanText(raw.id, 80);
  const title = cleanText(raw.title, 160);
  const summary = cleanText(raw.summary, 800);
  const cover = cleanText(raw.cover, 300);
  const body = cleanHtml(raw.body, "");
  if (!id || !title || !summary || !body || !cover || !isStoredCover(cover)) return null;
  return { id, title, summary, body, cover };
}

export function normalizeDevelopments(raw: unknown): AboutDevelopment[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const developments: AboutDevelopment[] = [];
  for (const item of raw) {
    const development = normalizeDevelopment(item as Partial<AboutDevelopment>);
    if (!development || seen.has(development.id)) continue;
    seen.add(development.id);
    developments.push(development);
    if (developments.length >= 48) break;
  }
  return developments;
}

export function normalizeAboutLab(raw: Partial<AboutLab> | null | undefined): AboutLab {
  const defaults = defaultAboutLab();
  if (!raw) return defaults;
  const bySlug = new Map(
    (Array.isArray(raw.directions) ? raw.directions : [])
      .filter((item): item is AboutDirection => Boolean(item && isDirectionSlug(String(item.slug))))
      .map((item) => [item.slug, item]),
  );
  return {
    eyebrow: cleanText(raw.eyebrow, 80) || defaults.eyebrow,
    title: cleanText(raw.title, 120) || defaults.title,
    lede: cleanText(raw.lede, 400) || defaults.lede,
    slogan: cleanText(raw.slogan, 200) || defaults.slogan,
    body: cleanHtml(raw.body, defaults.body),
    methodTitle: cleanText(raw.methodTitle, 120) || defaults.methodTitle,
    methodBody: cleanHtml(raw.methodBody, defaults.methodBody),
    image: typeof raw.image === "string" && raw.image ? raw.image : undefined,
    contactTitle: cleanText(raw.contactTitle, 120) || defaults.contactTitle,
    contactLede: cleanText(raw.contactLede, 400) || defaults.contactLede,
    directions: defaults.directions.map((item) => mergeDirection(item, bySlug.get(item.slug))),
    projects: normalizeProjects(raw.projects),
    developments: normalizeDevelopments(raw.developments),
  };
}

export function getAboutLab(db = getDb()): AboutLab {
  const row = db.prepare("SELECT value FROM meta WHERE key = ?").get(META_KEY) as { value?: string } | undefined;
  if (!row?.value) return defaultAboutLab();
  try {
    return normalizeAboutLab(JSON.parse(row.value) as Partial<AboutLab>);
  } catch {
    return defaultAboutLab();
  }
}

export function saveAboutLab(next: AboutLab, db = getDb()) {
  const payload = JSON.stringify(normalizeAboutLab(next));
  db.prepare(
    `INSERT INTO meta (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ).run(META_KEY, payload);
}

export function getAboutDirection(slug: string, db = getDb()) {
  if (!isDirectionSlug(slug)) return null;
  return getAboutLab(db).directions.find((item) => item.slug === slug) ?? null;
}

/** Safe HTML for public pages. */
export function renderAboutHtml(source: string) {
  return sanitizeArticleHtml(ensureAboutHtml(source));
}
