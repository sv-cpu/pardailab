export const site = {
  name: "PardAiLabs",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pardailabs.ru",
  description:
    "Практический искусственный интеллект для людей и бизнеса. Независимая лаборатория: исследования, обзоры моделей и понятные сценарии без рекламной подачи.",
  author: "Лаборатория PardAiLabs",
};

export const nav = [
  { href: "/novosti", label: "Новости" },
  { href: "/praktika", label: "Практика" },
  { href: "/resheniya", label: "Каталог решений" },
  { href: "/razrabotka", label: "Разработка" },
  { href: "/issledovaniya", label: "Исследования" },
  { href: "/modeli", label: "Модели" },
  { href: "/katalog", label: "Каталог AI" },
] as const;
