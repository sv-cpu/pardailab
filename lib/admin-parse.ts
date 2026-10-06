import { aiCategories } from "@/lib/categories";
import { scoreFields } from "@/lib/scores";
import { sanitizeArticleHtml } from "@/lib/html";
import { transliterate } from "@/lib/rubric-seed";
import type { AiCategory, Article, ArticleKind, Block, ModelProfile, ModelScores, Service } from "@/lib/types";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const kinds = new Set<ArticleKind>(["news", "practice", "development", "research"]);
const categorySlugs = new Set<AiCategory>(aiCategories.map((item) => item.slug));

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function lines(value: string) {
  return value
    .split(/\r?\n/)
    .flatMap((line) => line.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

function required(value: string, label: string): ParseResult<string> {
  if (!value) return { ok: false, error: `Заполните поле «${label}».` };
  return { ok: true, value };
}

function parseSlug(value: string): ParseResult<string> {
  if (!slugPattern.test(value)) {
    return { ok: false, error: "Адрес — латиница в нижнем регистре, цифры и дефисы." };
  }
  return { ok: true, value };
}

export function articleSlug(title: string, rawSlug: string): ParseResult<string> {
  const typed = rawSlug.trim();
  const source = typed ? transliterate(typed) : transliterate(title);
  if (!source) return { ok: false, error: "Не удалось собрать адрес. Напишите название или адрес латиницей." };
  return parseSlug(source);
}

function htmlHasContent(html: string) {
  if (/<(img|iframe|video|audio|table|hr)\b/i.test(html)) return true;
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").trim().length > 0;
}

function parseScore(value: string, label: string): ParseResult<number> {
  const number = Number(value.replace(",", "."));
  if (!Number.isFinite(number) || number < 0 || number > 10) {
    return { ok: false, error: `«${label}» — число от 0 до 10.` };
  }
  return { ok: true, value: Math.round(number * 10) / 10 };
}

export function textToBlocks(source: string): Block[] {
  const chunks = source.replace(/\r\n/g, "\n").trim().split(/\n{2,}/).filter(Boolean);
  if (!chunks.length) throw new Error("Добавьте текст материала.");
  return chunks.map((chunk) => {
    const rows = chunk.split("\n");
    const first = rows[0] ?? "";
    if (first.startsWith("## ")) {
      const heading = [first.slice(3).trim(), ...rows.slice(1).map((row) => row.trim())].filter(Boolean).join(" ");
      if (!heading) throw new Error("Пустой заголовок.");
      return { type: "h2", text: heading } satisfies Block;
    }
    if (rows.every((row) => row.startsWith("- "))) {
      const items = rows.map((row) => row.slice(2).trim());
      if (items.some((item) => !item)) throw new Error("Пустой пункт списка.");
      return { type: "ul", items } satisfies Block;
    }
    if (rows.every((row) => /^\d+\.\s+/.test(row))) {
      const items = rows.map((row) => row.replace(/^\d+\.\s+/, "").trim());
      if (items.some((item) => !item)) throw new Error("Пустой пункт списка.");
      return { type: "ol", items } satisfies Block;
    }
    if (first.startsWith("> ")) {
      const title = first.slice(2).trim();
      const note = rows.slice(1).join("\n").trim();
      if (!title || !note) throw new Error("Заметка: первая строка — заголовок после «> », дальше текст.");
      return { type: "note", title, text: note } satisfies Block;
    }
    const paragraph = rows.join(" ").trim();
    if (!paragraph) throw new Error("Пустой абзац.");
    return { type: "p", text: paragraph } satisfies Block;
  });
}

export function blocksToText(blocks: Block[]) {
  return blocks
    .map((block) => {
      if (block.type === "h2") return `## ${block.text}`;
      if (block.type === "ul") return block.items.map((item) => `- ${item}`).join("\n");
      if (block.type === "ol") return block.items.map((item, index) => `${index + 1}. ${item}`).join("\n");
      if (block.type === "note") return `> ${block.title}\n${block.text}`;
      if (block.type === "html") return block.html;
      return block.text;
    })
    .join("\n\n");
}

export function parseArticle(form: FormData): ParseResult<Article> {
  const title = required(text(form, "title"), "Название");
  if (!title.ok) return title;
  const slug = articleSlug(title.value, text(form, "slug"));
  if (!slug.ok) return slug;
  const kindValue = text(form, "kind") as ArticleKind;
  const kind = kinds.has(kindValue) ? kindValue : "news";
  const description = required(text(form, "description"), "Описание");
  if (!description.ok) return description;
  const rubric = text(form, "rubric");
  const subrubric = text(form, "subrubric");
  const rubric2 = text(form, "rubric2");
  const subrubric2 = text(form, "subrubric2");
  if (rubric2 && rubric2 === rubric && subrubric2 === subrubric) {
    return { ok: false, error: "Вторая рубрика совпадает с первой." };
  }
  const categoryText = text(form, "category");
  const category = categoryText || subrubric || rubric;
  if (!category) return { ok: false, error: "Выберите рубрику." };
  const day = text(form, "date");
  const clock = text(form, "time");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return { ok: false, error: "Дата в формате ГГГГ-ММ-ДД." };
  if (clock && !/^\d{2}:\d{2}$/.test(clock)) return { ok: false, error: "Время в формате ЧЧ:ММ." };
  const date = clock ? `${day}T${clock}` : day;
  const placements = [
    ...(rubric ? [{ rubric, ...(subrubric ? { subrubric } : {}) }] : []),
    ...(rubric2 ? [{ rubric: rubric2, ...(subrubric2 ? { subrubric: subrubric2 } : {}) }] : []),
  ];
  const author = text(form, "author") || "Редакция";
  const coverValue = Number(text(form, "cover"));
  const cover = Number.isInteger(coverValue) && coverValue >= 0 && coverValue <= 5 ? coverValue : 0;
  const tags = lines(text(form, "tags"));
  let body: Block[];
  const rawHtml = text(form, "bodyHtml");
  const html = sanitizeArticleHtml(rawHtml);
  const rawVisible = rawHtml.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").trim();
  if (html && htmlHasContent(html)) {
    body = [{ type: "html", html }];
  } else if (rawVisible || /<(img|iframe|video|audio|table)\b/i.test(rawHtml)) {
    return { ok: false, error: "Текст не сохранился: после очистки HTML в статье ничего не осталось." };
  } else if (text(form, "body")) {
    try {
      body = textToBlocks(text(form, "body"));
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Не удалось прочитать текст." };
    }
  } else {
    return { ok: false, error: "Добавьте текст материала." };
  }
  const article: Article = {
    slug: slug.value,
    kind,
    title: title.value,
    description: description.value,
    category,
    ...(rubric ? { rubric } : {}),
    ...(subrubric ? { subrubric } : {}),
    ...(placements.length ? { placements } : {}),
    date,
    author,
    readingMinutes: readingMinutes(body),
    cover,
    tags,
    body,
  };
  return { ok: true, value: article };
}

function readingMinutes(body: Block[]) {
  const words = body
    .flatMap((block) => {
      if (block.type === "ul" || block.type === "ol") return block.items;
      if (block.type === "html") return [block.html.replace(/<[^>]+>/g, " ")];
      if (block.type === "note") return [block.title, block.text];
      return [block.text];
    })
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.min(180, Math.max(1, Math.round(words / 180)));
}

export function parseService(form: FormData): ParseResult<Service> {
  const slug = parseSlug(text(form, "slug"));
  if (!slug.ok) return slug;
  const name = required(text(form, "name"), "Название");
  if (!name.ok) return name;
  const mark = text(form, "mark").toUpperCase();
  if (!/^[A-ZА-ЯЁ0-9]{2}$/.test(mark)) return { ok: false, error: "Знак — две буквы или цифры." };
  const description = required(text(form, "description"), "Описание");
  if (!description.ok) return description;
  const price = required(text(form, "price"), "Цена");
  if (!price.ok) return price;
  const rating = parseScore(text(form, "rating"), "Оценка");
  if (!rating.ok) return rating;
  const website = text(form, "website");
  if (!/^https:\/\/\S+$/.test(website)) return { ok: false, error: "Сайт — адрес, который начинается с https://." };
  const pros = lines(text(form, "pros"));
  const cons = lines(text(form, "cons"));
  const domains = lines(text(form, "domains"));
  const similar = lines(text(form, "similar"));
  const tags = lines(text(form, "tags"));
  const categories = form.getAll("categories").map(String) as AiCategory[];
  if (!pros.length || !cons.length || !domains.length || !similar.length || !tags.length) {
    return { ok: false, error: "Плюсы, минусы, области, похожие сервисы и метки не должны быть пустыми." };
  }
  if (!categories.length || categories.some((item) => !categorySlugs.has(item))) {
    return { ok: false, error: "Отметьте хотя бы одну категорию каталога." };
  }
  if (similar.some((item) => !slugPattern.test(item))) {
    return { ok: false, error: "Похожие сервисы — адреса через запятую или с новой строки." };
  }
  return {
    ok: true,
    value: {
      slug: slug.value,
      name: name.value,
      mark,
      description: description.value,
      price: price.value,
      rating: rating.value,
      pros,
      cons,
      domains,
      website,
      similar,
      categories,
      tags,
    },
  };
}

export function parseModel(form: FormData): ParseResult<ModelProfile> {
  const slug = parseSlug(text(form, "slug"));
  if (!slug.ok) return slug;
  const name = required(text(form, "name"), "Название");
  if (!name.ok) return name;
  const vendor = required(text(form, "vendor"), "Вендор");
  if (!vendor.ok) return vendor;
  const summary = required(text(form, "summary"), "Кратко");
  if (!summary.ok) return summary;
  const bestFor = required(text(form, "bestFor"), "Когда брать");
  if (!bestFor.ok) return bestFor;
  const avoidWhen = required(text(form, "avoidWhen"), "Когда не брать");
  if (!avoidWhen.ok) return avoidWhen;
  const tags = lines(text(form, "tags"));
  if (!tags.length) return { ok: false, error: "Добавьте хотя бы одну метку." };
  const scores = {} as ModelScores;
  for (const [key, label] of scoreFields) {
    const score = parseScore(text(form, key), label);
    if (!score.ok) return score;
    scores[key] = score.value;
  }
  return {
    ok: true,
    value: {
      slug: slug.value,
      name: name.value,
      vendor: vendor.value,
      summary: summary.value,
      bestFor: bestFor.value,
      avoidWhen: avoidWhen.value,
      scores,
      tags,
    },
  };
}
