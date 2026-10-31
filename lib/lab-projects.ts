import type { AboutProject } from "@/lib/about.shared";

export type LabProjectMedia = {
  src: string;
  alt: string;
  caption: string;
};

export type LabProjectFact = {
  value: string;
  label: string;
};

export type LabProjectSpecRow = {
  label: string;
  value: string;
};

export type LabProjectSection = {
  id: string;
  title: string;
  body?: string[];
  rows?: LabProjectSpecRow[];
  list?: string[];
  note?: string;
};

export type LabProjectDownload = {
  href: string;
  label: string;
  hint: string;
};

export type LabProject = {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  lede: string;
  cover: string;
  revision: string;
  facts: LabProjectFact[];
  highlights: { title: string; text: string }[];
  gallery: LabProjectMedia[];
  sections: LabProjectSection[];
  printParts: LabProjectSpecRow[];
  downloads: LabProjectDownload[];
};

const media = (file: string) => `/projects/nizhegorodets-g6/${file}`;

export const labProjects: LabProject[] = [
  {
    id: "nizhegorodets-g6",
    slug: "nizhegorodets-g6",
    title: "Нижегородец Г6",
    teaser:
      "Гексакоптер с полезной нагрузкой до 5 кг, модульной связью на штекерах и универсальным узлом сброса. До 10 км с грузом и возврат пустым.",
    lede:
      "Собственная конструкция лаборатории на раме КРАМС: доставка и сброс нагрузки, замена RX и VTX в поле без пайки, комплект 3D-печатных узлов и рабочий дамп Betaflight.",
    cover: media("cover.jpg"),
    revision: "Документация v0.3.1 · октябрь 2026",
    facts: [
      { value: "5 кг", label: "полезная нагрузка" },
      { value: "10 км", label: "с грузом · возврат пустым" },
      { value: "На штекерах", label: "RX и VTX без пайки" },
      { value: "Универсальный", label: "узел сброса" },
    ],
    highlights: [
      {
        title: "Лётные качества",
        text: "Запас тяги гекса, устойчивый вис с грузом, дальность до 10 км с полезной нагрузкой и возврат без груза.",
      },
      {
        title: "Модульная связь",
        text: "Приёмник и видеопередатчик на штекерах: замена в поле без пайки под задачу, частоту или тип модуля.",
      },
      {
        title: "Сброс",
        text: "Универсальное устройство сброса на днище; управление с пульта, проверка на земле и в полёте.",
      },
    ],
    gallery: [
      {
        src: media("cover.jpg"),
        alt: "Нижегородец Г6 зимой с двумя аккумуляторами сверху",
        caption: "Рабочая конфигурация · два АКБ сверху",
      },
      {
        src: media("detail.jpg"),
        alt: "Крупный план Нижегородца Г6",
        caption: "Общий вид · 6 лучей · 4 ноги",
      },
      {
        src: media("battery.jpg"),
        alt: "Аккумуляторные пакеты и разъём питания",
        caption: "Питание · пакеты 6S4P ~16 А·ч",
      },
      {
        src: media("flight-3.jpg"),
        alt: "Кадр полёта с полезной нагрузкой",
        caption: "Полёт · вис с канистрой",
      },
      {
        src: media("flight-1.jpg"),
        alt: "Аппарат на земле",
        caption: "На земле · подготовка",
      },
      {
        src: media("flight-2.jpg"),
        alt: "Корпус и лучи без пропеллеров",
        caption: "Без пропов · корпус и лучи",
      },
    ],
    sections: [
      {
        id: "naznachenie",
        title: "Назначение",
        body: [
          "Нижегородец Г6 — гексакоптер класса 10″ для доставки и сброса полезной нагрузки до 5 кг. Типовой профиль: вылет с грузом на дистанцию до 10 км и возврат без груза.",
          "Модули управления (RX) и видео (VTX) стоят на разъёмах. Приёмник и передатчик можно заменить в поле без пайки — под другую задачу, частоту или тип модуля.",
        ],
      },
      {
        id: "letnye",
        title: "Лётные параметры",
        rows: [
          { label: "Грузоподъёмность", value: "до 5 кг" },
          { label: "Дальность с грузом", value: "до 10 км, возврат пустым" },
          { label: "Схема", value: "Гексакоптер · микшер HEX6X" },
          { label: "Пропеллеры", value: "Gemfan 1050 (10″) × 6" },
          { label: "Моторы", value: "KN3214 700 KV × 6" },
          { label: "Питание на вылете", value: "2 × ≈16 А·ч, 6S4P (оба пакета сверху)" },
          { label: "Взлётная масса (2×АКБ)", value: "≈ 6,1 кг без груза · до ~11 кг с 5 кг нагрузки" },
          { label: "Габарит по пропам", value: "≈ 850–900 мм" },
        ],
      },
      {
        id: "svyaz",
        title: "Связь, видео, сброс",
        rows: [
          { label: "Модульная связь", value: "RX и VTX на штекерах · замена в поле без пайки" },
          { label: "Управление (типовой)", value: "ELRS 2,4 ГГц · CRSF" },
          { label: "Видео (типовой)", value: "VTX 3,3 ГГц 5 Вт · камера Foxeer Razer на серво" },
          { label: "Сброс", value: "Универсальное устройство · управление с пульта" },
          { label: "Полётный контроллер", value: "SpeedyBee F405 V3 · Betaflight 4.4.3" },
          { label: "Рама", value: "КРАМС + трубы Ø20×18 · 6 лучей · 4 ноги" },
        ],
      },
      {
        id: "bom",
        title: "Спецификация",
        rows: [
          { label: "Мотор KN3214 700 KV", value: "6" },
          { label: "ESC JHEMCU 65A 4-in-1", value: "2" },
          { label: "PDB", value: "1" },
          { label: "Пропеллеры Gemfan 1050", value: "6" },
          { label: "Серво DS3218MG 20 кг·см 180°", value: "1" },
          { label: "Крепление трубы 20 мм", value: "4" },
          { label: "Труба карбон 20×18×250", value: "6" },
          { label: "Рама КРАМС", value: "1" },
          { label: "Пластик 3D (PETG/ABS)", value: "1 комплект" },
          { label: "Камера Foxeer Razer", value: "1" },
          { label: "FC SpeedyBee F405", value: "1" },
          { label: "RX ELRS 2,4", value: "1" },
          { label: "VTX 3,3 ГГц 5 Вт", value: "1" },
          { label: "Ячейки 21700", value: "48" },
          { label: "Зарядка (заряд 6S)", value: "2" },
        ],
        note: "АКБ: 2 × ≈16 А·ч · топология 6S4P · ном. 22,2 В · полная ≈ 25,2 В · баланс JST-XH 7 pin.",
      },
      {
        id: "sborka",
        title: "Сборка",
        list: [
          "Рама: КРАМС + 6 труб Ø20 + 4 ноги.",
          "Моторы и пропы: KN3214; пропеллеры — после Motor test.",
          "FC / ESC: печатные крепления; проверка КЗ до подключения АКБ.",
          "Связь: RX и VTX на штекерах; типовой контур — ELRS UART6 CRSF + VTX 3,3 ГГц 5 Вт; антенны до включения.",
          "Камера и серво на печатном узле; питание серво с DC-DC.",
          "Универсальный сброс на днище; проверка на столе.",
          "АКБ: оба пакета сверху, стяжки/Velcro; заряд как 6S.",
        ],
        note: "Силовая схема: АКБ 6S4P ×2 → XT → PDB → ESC A (M1–M3) / FC / ESC B (M4–M6). Микшер HEX6X, нос вверх.",
      },
      {
        id: "nastrojka",
        title: "Настройка Betaflight",
        rows: [
          { label: "Прошивка", value: "BF 4.4.3 · SPEEDYBEEF405V3" },
          { label: "Mixer", value: "HEX6X" },
          { label: "RX", value: "CRSF · UART6" },
          { label: "Моторы", value: "DShot300 · idle 550 · 14 poles" },
          { label: "Серво", value: "SERVO_TILT · CH7 / CH8" },
          { label: "ARM / ANGLE", value: "AUX1 / AUX4" },
          { label: "Карта", value: "AETR" },
        ],
        note: "Ориентир пульта TX12: arm → ARM, angle → ANGLE, поворот камеры → серво, сброс → универсальный узел. Каналы ANGLE / серво / сброс сверить на столе — в дампе возможны пересечения.",
      },
    ],
    printParts: [
      { label: "Борта", value: "закрытые борта б6" },
      { label: "Крепление FC", value: "крепление полётника и силовых проводов" },
      { label: "Ноги 20 мм", value: "новые ноги 20 мм" },
      { label: "Камера + серво", value: "камера на сервоприводе б6" },
      { label: "RX / VTX", value: "коннекторы v2" },
      { label: "DCDC", value: "крепление DC-DC преобразователя" },
      { label: "Сброс", value: "сброс кащей под б6" },
    ],
    downloads: [
      {
        href: media("configs/BOM.csv"),
        label: "BOM.csv",
        hint: "Спецификация комплектующих",
      },
      {
        href: media("configs/g6_speedybee_f405_betaflight.txt"),
        label: "Дамп Betaflight",
        hint: "Конфиг SpeedyBee F405 · BF 4.4.3",
      },
    ],
  },
];

export function labProjectHref(slug: string) {
  return `/o-nas/proekty/${slug}`;
}

export function getLabProject(slug: string) {
  return labProjects.find((item) => item.slug === slug) ?? null;
}

export function labProjectSlugs() {
  return labProjects.map((item) => item.slug);
}

/** Карточки витрины «Проекты» из каталога лабораторных проектов. */
export function labProjectsAsCards(): AboutProject[] {
  return labProjects.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.teaser,
    cover: item.cover,
    url: labProjectHref(item.slug),
  }));
}

/**
 * Публичная витрина: сначала проекты из кода, затем карточки из админки.
 * Карточка админки с тем же id перекрывает каталожную.
 */
export function mergeAboutProjects(adminProjects: AboutProject[]): AboutProject[] {
  const curated = labProjectsAsCards();
  const byId = new Map(adminProjects.map((item) => [item.id, item]));
  const curatedIds = new Set(curated.map((item) => item.id));
  const mergedCurated = curated.map((item) => {
    const override = byId.get(item.id);
    if (!override) return item;
    return {
      ...item,
      ...override,
      url: override.url || item.url,
      cover: isLabProjectCover(override.cover) || isStoredUploadsCover(override.cover) ? override.cover : item.cover,
    };
  });
  const extras = adminProjects.filter((item) => !curatedIds.has(item.id));
  return [...mergedCurated, ...extras];
}

export function isLabProjectCover(value: string) {
  return /^\/projects\/[a-z0-9-]+\/[a-z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(value);
}

function isStoredUploadsCover(value: string) {
  return /^\/uploads\/covers\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(value);
}
