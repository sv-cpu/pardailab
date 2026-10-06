export type ArticleKind = "news" | "practice" | "development" | "research";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "note"; title: string; text: string }
  | { type: "html"; html: string };

export interface ResearchMeta {
  number: number;
  topic: string;
  status: "verified";
}

export interface Article {
  slug: string;
  kind: ArticleKind;
  title: string;
  description: string;
  category: string;
  rubric?: string;
  subrubric?: string;
  /** До двух пар «рубрика + подрубрика». Первая совпадает с `rubric` и задаёт адрес страницы. */
  placements?: { rubric: string; subrubric?: string }[];
  date: string;
  author: string;
  authorSlug?: string;
  readingMinutes: number;
  cover: number;
  /** Загруженный кадр 16:9. Если нет, на сайте остаётся готовая обложка `cover`. */
  coverImage?: string;
  tags: string[];
  whyItMatters?: string;
  research?: ResearchMeta;
  body: Block[];
}

export type AiCategory =
  | "tekst"
  | "video"
  | "izobrazheniya"
  | "muzyka"
  | "avtomatizaciya"
  | "programmirovanie"
  | "poisk"
  | "golos"
  | "biznes"
  | "obrazovanie";

export interface Service {
  slug: string;
  name: string;
  mark: string;
  description: string;
  price: string;
  rating: number;
  pros: string[];
  cons: string[];
  domains: string[];
  website: string;
  similar: string[];
  categories: AiCategory[];
  tags: string[];
}

export interface ModelScores {
  speed: number;
  cost: number;
  quality: number;
  russian: number;
  code: number;
  agents: number;
  documents: number;
  context: number;
}

export interface ModelProfile {
  slug: string;
  name: string;
  /** Полное название с версией. В таблице рейтинга показывается оно. */
  versionName?: string;
  /** Участие в десятке рейтинга. Пустое значение значит «участвует». */
  inRating?: boolean;
  vendor: string;
  summary: string;
  bestFor: string;
  avoidWhen: string;
  scores: ModelScores;
  tags: string[];
}

export interface RatedModel extends Omit<ModelProfile, "scores"> {
  scores: ModelScores & { overall: number };
}

export interface ArticleIndex {
  slug: string;
  kind: ArticleKind;
  title: string;
  description: string;
  category: string;
  tags: string[];
  readingMinutes: number;
}

export interface CatalogSnapshot {
  models: RatedModel[];
  services: Service[];
  articles: ArticleIndex[];
}

export type Intent =
  | "text"
  | "code"
  | "image"
  | "video"
  | "music"
  | "voice"
  | "search"
  | "automation"
  | "documents"
  | "study"
  | "business"
  | "agents";

export interface Recommendation {
  intent: Intent | "general";
  intentLabel: string;
  model: RatedModel;
  service: Service;
  article: ArticleIndex;
  reasons: string[];
}
