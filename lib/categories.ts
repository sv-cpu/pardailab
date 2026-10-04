import type { AiCategory } from "@/lib/types";

export const aiCategories: { slug: AiCategory; label: string; description: string }[] = [
  {
    slug: "tekst",
    label: "Текст",
    description: "Черновики, редактура, письма и рабочие формулировки.",
  },
  {
    slug: "video",
    label: "Видео",
    description: "Ролики и раскадровка там, где генеративный сервис уместен, а не обязателен.",
  },
  {
    slug: "izobrazheniya",
    label: "Изображения",
    description: "Иллюстрации и визуальные черновики. Это не замена съёмке и бренд-дизайну.",
  },
  {
    slug: "muzyka",
    label: "Музыка",
    description: "Эскизы треков и фоновые темы. Права на коммерческое использование проверяйте отдельно.",
  },
  {
    slug: "avtomatizaciya",
    label: "Автоматизация",
    description: "Заявки, уведомления и повторяемые операции между сервисами.",
  },
  {
    slug: "programmirovanie",
    label: "Программирование",
    description: "Инструменты, которые работают внутри проекта, а не в отдельном чате.",
  },
  {
    slug: "poisk",
    label: "Поиск",
    description: "Ответы со ссылками, когда важнее найти источник, чем красиво написать.",
  },
  {
    slug: "golos",
    label: "Голос",
    description: "Озвучка и речевые сценарии с понятной границей ответственности.",
  },
  {
    slug: "biznes",
    label: "Бизнес",
    description: "Документы, продажи, маркетинг и внутренние процессы компании.",
  },
  {
    slug: "obrazovanie",
    label: "Образование",
    description: "Разбор материала, когда цель — понять, а не сдать чужой текст.",
  },
];

export function categoryBySlug(slug: string) {
  return aiCategories.find((item) => item.slug === slug);
}
