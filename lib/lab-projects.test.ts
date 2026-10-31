import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getLabProject,
  isCatalogLabProjectId,
  isLabProjectCover,
  labProjectHref,
  labProjectsAsCards,
  labProjectSlugs,
  mergeAboutProjects,
  resolveLabProject,
} from "./lab-projects";

describe("lab projects catalog", () => {
  it("exposes nizhegorodets-g6 with a site page and cover under /projects", () => {
    const project = getLabProject("nizhegorodets-g6");
    assert.ok(project);
    assert.equal(project?.title, "Нижегородец Г6");
    assert.equal(labProjectHref(project!.slug), "/o-nas/proekty/nizhegorodets-g6");
    assert.ok(isLabProjectCover(project!.cover));
    assert.ok(labProjectSlugs().includes("nizhegorodets-g6"));
  });

  it("builds project cards for the about grid", () => {
    const cards = labProjectsAsCards();
    assert.equal(cards.length, 1);
    assert.equal(cards[0]?.id, "nizhegorodets-g6");
    assert.equal(cards[0]?.url, "/o-nas/proekty/nizhegorodets-g6");
  });

  it("keeps admin order and overrides catalog fields by id", () => {
    const merged = mergeAboutProjects([
      {
        id: "other",
        title: "Другой",
        description: "Из админки.",
        cover: "/uploads/covers/00000000-0000-4000-8000-000000000098.jpg",
      },
      {
        id: "nizhegorodets-g6",
        title: "Г6 (правка)",
        description: "Новое описание.",
        cover: "/uploads/covers/00000000-0000-4000-8000-000000000099.jpg",
        url: "/custom",
      },
    ]);
    assert.equal(merged.length, 2);
    assert.equal(merged[0]?.id, "other");
    assert.equal(merged[1]?.title, "Г6 (правка)");
    assert.equal(merged[1]?.url, "/custom");
  });

  it("prepends catalog projects that are not yet saved in admin", () => {
    const merged = mergeAboutProjects([
      {
        id: "other",
        title: "Другой",
        description: "Из админки.",
        cover: "/uploads/covers/00000000-0000-4000-8000-000000000098.jpg",
      },
    ]);
    assert.equal(merged[0]?.id, "nizhegorodets-g6");
    assert.equal(merged[1]?.id, "other");
  });

  it("rejects unsafe cover paths for lab project assets", () => {
    assert.equal(isLabProjectCover("/projects/../etc/passwd.jpg"), false);
    assert.equal(isLabProjectCover("https://evil.example/x.jpg"), false);
    assert.equal(isLabProjectCover("/projects/nizhegorodets-g6/cover.jpg"), true);
  });

  it("marks catalog ids and applies admin overrides on the project page", () => {
    assert.equal(isCatalogLabProjectId("nizhegorodets-g6"), true);
    assert.equal(isCatalogLabProjectId("other"), false);
    const resolved = resolveLabProject("nizhegorodets-g6", [
      {
        id: "nizhegorodets-g6",
        title: "Г6 обновлён",
        description: "Новый тизер.",
        cover: "/uploads/covers/00000000-0000-4000-8000-000000000077.jpg",
        url: "/o-nas/proekty/nizhegorodets-g6",
      },
    ]);
    assert.equal(resolved?.title, "Г6 обновлён");
    assert.equal(resolved?.teaser, "Новый тизер.");
    assert.equal(resolved?.cover, "/uploads/covers/00000000-0000-4000-8000-000000000077.jpg");
    assert.match(resolved?.lede ?? "", /Собственная конструкция/);
  });
});
