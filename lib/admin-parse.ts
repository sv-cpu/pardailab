import { aiCategories } from "@/lib/categories";
import { scoreFields } from "@/lib/scores";
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
      return block.text;
    })
    .join("\n\n");
}

export function parseArticle(form: FormData): ParseResult<Article> {
  const slug = parseSlug(text(form, "slug"));
  if (!slug.ok) return slug;
  const kind = text(form, "kind") as ArticleKind;
  if (!kinds.has(kind)) return { ok: false, error: "Выберите раздел." };
  const title = required(text(form, "title"), "Название");
  if (!title.ok) return title;
  const description = required(text(form, "description"), "Описание");
  if (!description.ok) return description;
  const rubric = text(form, "rubric");
  const subrubric = text(form, "subrubric");
  const categoryText = text(form, "category");
  const category = categoryText || subrubric || rubric;
  if (!category) return { ok: false, error: "Выберите рубрику." };
  const date = text(form, "date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: "Дата в формате ГГГГ-ММ-ДД." };
  const author = required(text(form, "author"), "Автор");
  if (!author.ok) return author;
  const reading = Number(text(form, "readingMinutes"));
  if (!Number.isInteger(reading) || reading < 1 || reading > 180) {
    return { ok: false, error: "Время чтения — целое число минут от 1 до 180." };
  }
  const cover = Number(text(form, "cover"));
  if (!Number.isInteger(cover) || cover < 0 || cover > 5) return { ok: false, error: "Выберите обложку." };
  const tags = lines(text(form, "tags"));
  if (!tags.length) return { ok: false, error: "Добавьте хотя бы одну метку." };
  let body: Block[];
  try {
    body = textToBlocks(text(form, "body"));
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Не удалось прочитать текст." };
  }
  const why = text(form, "whyItMatters");
  const article: Article = {
    slug: slug.value,
    kind,
    title: title.value,
    description: description.value,
    category,
    ...(rubric ? { rubric } : {}),
    ...(subrubric ? { subrubric } : {}),
    date,
    author: author.value,
    readingMinutes: reading,
    cover,
    tags,
    body,
  };
  if (why) article.whyItMatters = why;
  if (kind === "research") {
    const number = Number(text(form, "researchNumber"));
    const topic = text(form, "researchTopic");
    if (!Number.isInteger(number) || number < 1) return { ok: false, error: "Номер исследования — целое число." };
    if (!topic) return { ok: false, error: "Заполните тему исследования." };
    article.research = { number, topic, status: "verified" };
  }
  return { ok: true, value: article };
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
