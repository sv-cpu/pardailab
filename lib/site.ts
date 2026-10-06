export const site = {
  name: "PardAiLabs",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pardailab.ru",
  description:
    "Практический искусственный интеллект для людей и бизнеса. Независимая лаборатория: исследования, обзоры моделей и понятные сценарии без рекламной подачи.",
  author: "Лаборатория PardAiLabs",
};

export const sections = [
  { href: "/novosti", label: "Новости" },
  { href: "/praktika", label: "Практика" },
  { href: "/razrabotka", label: "Разработка" },
  { href: "/issledovaniya", label: "Исследования" },
] as const;

export const library = [
  { href: "/modeli", label: "Модели" },
  { href: "/resheniya", label: "Каталог решений" },
  { href: "/katalog", label: "Каталог AI" },
] as const;

export const nav = [...sections, ...library] as const;
