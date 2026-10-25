import { getDb } from "@/lib/db";
import {
  aboutDirectionSlugs,
  ensureAboutHtml,
  type AboutDirection,
  type AboutDirectionSlug,
  type AboutLab,
} from "@/lib/about.shared";
import { sanitizeArticleHtml } from "@/lib/html";

export {
  aboutDirectionHref,
  aboutDirectionSlugs,
  aboutParagraphs,
  ensureAboutHtml,
  type AboutDirection,
  type AboutDirectionSlug,
  type AboutLab,
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
