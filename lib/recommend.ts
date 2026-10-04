import { articleHref } from "@/lib/paths";
import { formatScore } from "@/lib/format";
import type {
  AiCategory,
  ArticleIndex,
  CatalogSnapshot,
  Intent,
  ModelScores,
  RatedModel,
  Recommendation,
  Service,
} from "@/lib/types";

export interface RecommendInput {
  task: string;
  budgetMatters: boolean;
  russianMatters: boolean;
  needsCode: boolean;
}

const intentLabels: Record<Intent | "general", string> = {
  text: "Текст",
  code: "Код",
  image: "Изображения",
  video: "Видео",
  music: "Музыка",
  voice: "Голос",
  search: "Поиск",
  automation: "Автоматизация",
  documents: "Документы",
  study: "Учёба",
  business: "Бизнес",
  agents: "Агенты",
  general: "Общая задача",
};

const keywords: Record<Intent, string[]> = {
  code: ["код", "програм", "разработ", "cursor", "баг", "рефактор", "скрипт"],
  image: ["изображ", "картин", "иллюстра", "обложк", "макет", "фото"],
  video: ["видео", "ролик", "монтаж", "раскадр"],
  music: ["музык", "песн", "трек", "саунд", "мелод"],
  voice: ["голос", "озвуч", "диктор", "речью", "начит"],
  automation: ["автомат", "n8n", "заявк", "интеграц", "crm"],
  search: ["найти", "поиск", "источник", "ссылк", "обзор"],
  documents: ["договор", "документ", "регламент", "pdf", "контракт"],
  agents: ["агент", "поддержк", "бот"],
  study: ["учеб", "экзамен", "конспект", "студент", "урок", "школ"],
  business: ["бизнес", "продаж", "маркетинг", "клиент", "офис"],
  text: ["текст", "письм", "написать", "редак", "стать", "пост"],
};

const priority: Intent[] = [
  "code",
  "image",
  "voice",
  "music",
  "video",
  "automation",
  "search",
  "documents",
  "agents",
  "study",
  "business",
  "text",
];

const weights: Record<Intent, Partial<Record<keyof ModelScores, number>>> = {
  text: { quality: 0.46, russian: 0.34, speed: 0.2 },
  code: { code: 0.7, quality: 0.2, agents: 0.1 },
  image: { quality: 0.6, russian: 0.25, speed: 0.15 },
  video: { quality: 0.55, speed: 0.25, russian: 0.2 },
  music: { quality: 0.5, speed: 0.3, cost: 0.2 },
  voice: { quality: 0.5, russian: 0.35, speed: 0.15 },
  search: { quality: 0.45, speed: 0.25, russian: 0.3 },
  automation: { agents: 0.4, quality: 0.35, cost: 0.25 },
  documents: { documents: 0.42, context: 0.24, russian: 0.22, quality: 0.12 },
  study: { russian: 0.35, documents: 0.25, quality: 0.25, cost: 0.15 },
  business: { quality: 0.4, russian: 0.3, documents: 0.2, cost: 0.1 },
  agents: { agents: 0.5, quality: 0.25, documents: 0.15, russian: 0.1 },
};

const specialists: Partial<Record<Intent, AiCategory>> = {
  code: "programmirovanie",
  image: "izobrazheniya",
  video: "video",
  music: "muzyka",
  voice: "golos",
  automation: "avtomatizaciya",
  search: "poisk",
  study: "obrazovanie",
};

const modelService: Record<string, string> = {
  gpt: "chatgpt",
  claude: "claude",
  gemini: "gemini",
};

const articleHints: Record<Intent, string[]> = {
  code: ["код", "cursor", "разработка"],
  image: ["маркетинг", "иллюстрации"],
  video: ["видео", "ролик"],
  music: ["музыка"],
  voice: ["голос", "озвучка"],
  automation: ["автоматизация", "n8n", "заявки"],
  search: ["поиск", "источники"],
  documents: ["договор", "документы", "контекст"],
  study: ["учеба", "конспект"],
  business: ["бизнес", "продажи", "маркетинг"],
  agents: ["агенты", "поддержка"],
  text: ["текст", "письмо", "chatgpt"],
};

function normalize(value: string) {
  return value.toLocaleLowerCase("ru-RU").replaceAll("ё", "е");
}

function detectIntent(task: string): Intent | null {
  const text = normalize(task);
  const hits = priority
    .map((intent) => ({
      intent,
      score: keywords[intent].reduce((sum, word) => sum + (text.includes(normalize(word)) ? 1 : 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || priority.indexOf(a.intent) - priority.indexOf(b.intent));
  return hits[0]?.intent ?? null;
}

function rankModels(models: RatedModel[], intent: Intent, input: RecommendInput) {
  const base = { ...weights[intent] };
  if (input.budgetMatters) base.cost = (base.cost ?? 0) + 0.35;
  if (input.russianMatters) base.russian = (base.russian ?? 0) + 0.12;
  if (input.needsCode) base.code = (base.code ?? 0) + 0.3;
  const weightSum = Object.values(base).reduce((sum, value) => sum + (value ?? 0), 0) || 1;

  return [...models].sort((a, b) => score(b) - score(a) || b.scores.overall - a.scores.overall);

  function score(model: RatedModel) {
    const total = Object.entries(base).reduce((sum, [key, value]) => {
      return sum + model.scores[key as keyof ModelScores] * (value ?? 0);
    }, 0);
    return total / weightSum;
  }
}

function pickService(intent: Intent, model: RatedModel, services: Service[]) {
  const category = specialists[intent];
  if (category) {
    const pool = services.filter((service) => service.categories.includes(category));
    if (pool.length) {
      return [...pool].sort((a, b) => b.rating - a.rating)[0];
    }
  }
  const preferred = services.find((service) => service.slug === modelService[model.slug]);
  if (preferred) return preferred;
  return [...services].sort((a, b) => b.rating - a.rating)[0];
}

function pickArticle(intent: Intent, articles: ArticleIndex[]) {
  const hints = articleHints[intent];
  const ranked = [...articles].sort(
    (a, b) => overlap(b) - overlap(a) || Number(b.kind === "research") - Number(a.kind === "research"),
  );
  return ranked[0] ?? articles[0];

  function overlap(article: ArticleIndex) {
    const tags = article.tags.map((tag) => normalize(tag));
    const text = normalize(`${article.title} ${article.description} ${tags.join(" ")}`);
    return hints.reduce((sum, hint) => sum + (text.includes(normalize(hint)) ? 1 : 0), 0);
  }
}

function focusLabel(intent: Intent) {
  const entries = Object.entries(weights[intent]).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  const names: Record<string, string> = {
    speed: "скорость",
    cost: "бережность к бюджету",
    quality: "качество",
    russian: "русский язык",
    code: "код",
    agents: "агентов",
    documents: "документы",
    context: "длинный контекст",
  };
  return entries
    .slice(0, 2)
    .map(([key]) => names[key])
    .join(" и ");
}

export function recommend(input: RecommendInput, catalog: CatalogSnapshot): Recommendation | null {
  const task = input.task.trim();
  if (task.length < 2 || !catalog.models.length || !catalog.services.length || !catalog.articles.length) {
    return null;
  }

  const intent = detectIntent(task);
  if (!intent) {
    const model = [...catalog.models].sort((a, b) => b.scores.overall - a.scores.overall)[0];
    const service = pickService("text", model, catalog.services);
    const article = pickArticle("text", catalog.articles);
    return {
      intent: "general",
      intentLabel: intentLabels.general,
      model,
      service,
      article,
      reasons: [
        `Формулировка слишком общая, поэтому показана модель с самой высокой итоговой оценкой — ${model.name} (${formatScore(model.scores.overall)}).`,
        "Уточните задачу: документ, код, картинка, голос, поиск или автоматизация.",
        "Подбор построен по шкале и каталогу лаборатории. Место в нём не продаётся.",
      ],
    };
  }

  const model = rankModels(catalog.models, intent, input)[0];
  const service = pickService(intent, model, catalog.services);
  const article = pickArticle(intent, catalog.articles);
  const focus = focusLabel(intent);

  return {
    intent,
    intentLabel: intentLabels[intent],
    model,
    service,
    article,
    reasons: [
      `Для задачи «${intentLabels[intent].toLowerCase()}» смотрим прежде всего на ${focus}. ${model.name} здесь уместнее остальных моделей шкалы.`,
      service.categories.includes("izobrazheniya") ||
      service.categories.includes("video") ||
      service.categories.includes("muzyka") ||
      service.categories.includes("golos")
        ? `${service.name} — основной инструмент результата. Модель нужна, чтобы собрать задание, а не вместо сервиса.`
        : `${service.name} закрывает тот же сценарий в каталоге: ${service.description}`,
      "Подбор построен по шкале и каталогу лаборатории. Место в нём не продаётся.",
    ],
  };
}

export function articleLink(article: ArticleIndex) {
  return articleHref(article.kind, article.slug);
}
