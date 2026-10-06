import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { articles } from "./content/articles";
import { rateModels } from "./content/models";
import { services } from "./content/services";
import { searchCatalog } from "./search";

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
