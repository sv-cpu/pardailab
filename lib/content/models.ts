import { overallScore } from "@/lib/scores";
import type { ModelProfile, RatedModel } from "@/lib/types";

export const models: ModelProfile[] = [
  {
    slug: "gpt",
    name: "GPT",
    vendor: "OpenAI",
    summary:
      "Универсальная модель для текста, кода и агентных сценариев. Дороже открытых альтернатив, зато реже требует второй инструмент рядом.",
    bestFor: "Одна модель на смешанные офисные и инженерные задачи, если бюджет не главный критерий.",
    avoidWhen: "Нужен свой закрытый контур или минимальная цена за большой объём одинаковых запросов.",
    scores: { speed: 8, cost: 6, quality: 9.2, russian: 8.4, code: 9, agents: 8.8, documents: 8.6, context: 8.5 },
    tags: ["gpt", "openai", "текст", "код", "агенты"],
  },
  {
    slug: "claude",
    name: "Claude",
    vendor: "Anthropic",
    summary:
      "Самый ровный профиль лаборатории для длинных документов, аккуратного русского и агентов, которые должны держать инструкцию.",
    bestFor: "Договоры, регламенты, редактура и агентные цепочки, где ошибка тона или пропуск пункта дороже скорости.",
    avoidWhen: "Нужна самая низкая цена или картинка и видео как основной результат.",
    scores: { speed: 7.5, cost: 6.2, quality: 9.4, russian: 8.8, code: 8.7, agents: 9.3, documents: 9.4, context: 9.2 },
    tags: ["claude", "anthropic", "документы", "русский", "агенты"],
  },
  {
    slug: "gemini",
    name: "Gemini",
    vendor: "Google",
    summary:
      "Сильный длинный контекст и удобная связка с поиском и документами Google. В русском и коде уступает лидерам шкалы, но не выпадает из рабочей зоны.",
    bestFor: "Большие подборки материалов и команды, которые уже живут в Google Workspace.",
    avoidWhen: "Нужен лучший деловой русский или автономный агент без присмотра.",
    scores: { speed: 8.6, cost: 7.4, quality: 8.6, russian: 8, code: 8.2, agents: 8, documents: 8.8, context: 9.6 },
    tags: ["gemini", "google", "контекст", "документы", "поиск"],
  },
  {
    slug: "qwen",
    name: "Qwen",
    vendor: "Alibaba Cloud",
    summary:
      "Сильная открытая линейка с хорошей ценой и уверенным кодом. Русский деловой стиль слабее моделей, которые мы ставим в первую очередь для писем и договоров.",
    bestFor: "Свой контур, массовые технические задачи и команды, которым важны открытые веса.",
    avoidWhen: "Клиентский текст на русском без редактора.",
    scores: { speed: 8.8, cost: 8.8, quality: 8, russian: 7.2, code: 8.4, agents: 7.6, documents: 7.8, context: 8.4 },
    tags: ["qwen", "открытые веса", "код", "цена"],
  },
  {
    slug: "deepseek",
    name: "DeepSeek",
    vendor: "DeepSeek",
    summary:
      "Один из самых выгодных вариантов для кода. Документы и русский требуют проверки: модель сильная, но тон и полнота проседают чаще, чем у Claude и GPT.",
    bestFor: "Разработка и черновики, где цена ответа важна, а результат всё равно смотрит человек.",
    avoidWhen: "Юридически значимый документ или внешняя коммуникация без вычитки.",
    scores: { speed: 8.4, cost: 9.4, quality: 8.3, russian: 7.6, code: 9.1, agents: 7.8, documents: 7.4, context: 7.8 },
    tags: ["deepseek", "код", "цена", "разработка"],
  },
  {
    slug: "mistral",
    name: "Mistral",
    vendor: "Mistral AI",
    summary:
      "Быстрые прикладные модели и европейский контур поставки. Для сложного агента и длинного русского документа это не первый выбор шкалы.",
    bestFor: "Короткие рабочие запросы, классификация и сценарии, где важны скорость и регион поставщика.",
    avoidWhen: "Длинный договор или многошаговый агент с доступом к системам компании.",
    scores: { speed: 9, cost: 8.2, quality: 7.8, russian: 7.4, code: 7.6, agents: 7.2, documents: 7.5, context: 7.6 },
    tags: ["mistral", "скорость", "европа", "классификация"],
  },
  {
    slug: "llama",
    name: "Llama",
    vendor: "Meta",
    summary:
      "Открытые веса для своего контура. Качество из коробки ниже коммерческих лидеров: модель раскрывается там, где есть инфраструктура и задача на контроль данных.",
    bestFor: "Компании, которым нельзя отправлять документы во внешний API.",
    avoidWhen: "Нужен максимум качества без своей команды, которая будет модель размещать и проверять.",
    scores: { speed: 8, cost: 9, quality: 7.6, russian: 6.8, code: 7.4, agents: 6.8, documents: 7, context: 7.2 },
    tags: ["llama", "meta", "открытые веса", "контур"],
  },
];

export function rateModels(list: ModelProfile[] = models): RatedModel[] {
  return list.map((model) => ({
    ...model,
    scores: { ...model.scores, overall: overallScore(model.scores) },
  }));
}

export function sortModels(list: RatedModel[]) {
  return [...list].sort(
    (a, b) =>
      b.scores.overall - a.scores.overall ||
      b.scores.quality - a.scores.quality ||
      a.name.localeCompare(b.name, "ru"),
  );
}
