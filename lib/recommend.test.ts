import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { articles } from "./content/articles";
import { rateModels } from "./content/models";
import { services } from "./content/services";
import { recommend } from "./recommend";
import { searchCatalog } from "./search";
import type { CatalogSnapshot } from "./types";

const catalog: CatalogSnapshot = {
  models: rateModels(),
  services,
  articles: articles.map(({ slug, kind, title, description, category, tags, readingMinutes }) => ({
    slug,
    kind,
    title,
    description,
    category,
    tags,
    readingMinutes,
  })),
};

const base = { budgetMatters: false, russianMatters: true, needsCode: false };

describe("recommend", () => {
  it("asks for a task when the field is empty", () => {
    assert.equal(recommend({ ...base, task: " " }, catalog), null);
  });

  it("sends code to a strong coding model and Cursor", () => {
    const result = recommend({ ...base, task: "написать и проверить код" }, catalog);
    assert.equal(result?.intent, "code");
    assert.equal(result?.model.slug, "gpt");
    assert.equal(result?.service.slug, "cursor");
  });

  it("prefers a cheaper coding model when budget matters", () => {
    const result = recommend({ ...base, budgetMatters: true, task: "написать код сервиса" }, catalog);
    assert.equal(result?.model.slug, "deepseek");
    assert.equal(result?.service.slug, "cursor");
  });

  it("sends a contract to Claude", () => {
    const result = recommend({ ...base, task: "разобрать договор поставки" }, catalog);
    assert.equal(result?.intent, "documents");
    assert.equal(result?.model.slug, "claude");
    assert.equal(result?.service.slug, "claude");
    assert.equal(result?.article.slug, "dlinnyy-kontekst-dogovory");
  });

  it("routes specialist tasks to specialist services", () => {
    assert.equal(recommend({ ...base, task: "собрать иллюстрацию обложки" }, catalog)?.service.slug, "midjourney");
    assert.equal(recommend({ ...base, task: "автоматизировать заявки из почты" }, catalog)?.service.slug, "n8n");
    assert.equal(recommend({ ...base, task: "найти источники для обзора" }, catalog)?.service.slug, "perplexity");
    assert.equal(recommend({ ...base, task: "озвучить короткий ролик" }, catalog)?.service.slug, "elevenlabs");
    assert.equal(recommend({ ...base, task: "музыка для ролика" }, catalog)?.service.slug, "suno");
    assert.equal(recommend({ ...base, task: "смонтировать видео" }, catalog)?.service.slug, "runway");
    assert.equal(recommend({ ...base, task: "конспект к экзамену" }, catalog)?.service.slug, "notebooklm");
  });

  it("falls back to the overall leader when the task is unclear", () => {
    const result = recommend({ ...base, task: "asdf qwerty" }, catalog);
    assert.equal(result?.intent, "general");
    assert.equal(result?.model.slug, "claude");
  });
});

describe("search", () => {
  it("finds a research article, a service and a model together", () => {
    const byModel = searchCatalog("claude", {
      articles,
      services,
      models: rateModels(),
    });
    assert.ok(byModel.articles.some((item) => item.href.includes("dlinnyy-kontekst")));
    assert.ok(byModel.services.some((item) => item.href.endsWith("/claude")));
    assert.ok(byModel.models.some((item) => item.href.endsWith("/claude")));
    const byTask = searchCatalog("договор", { articles, services, models: rateModels() });
    assert.ok(byTask.articles.some((item) => item.href.includes("dlinnyy-kontekst")));
  });
});
