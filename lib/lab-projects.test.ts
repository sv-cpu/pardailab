import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getLabProject,
  isLabProjectCover,
  labProjectHref,
  labProjectsAsCards,
  labProjectSlugs,
  mergeAboutProjects,
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

  it("merges curated cards ahead of admin cards and allows override by id", () => {
    const merged = mergeAboutProjects([
      {
        id: "nizhegorodets-g6",
        title: "Г6 (правка)",
        description: "Новое описание.",
        cover: "/uploads/covers/00000000-0000-4000-8000-000000000099.jpg",
        url: "/custom",
      },
      {
        id: "other",
        title: "Другой",
        description: "Из админки.",
        cover: "/uploads/covers/00000000-0000-4000-8000-000000000098.jpg",
      },
    ]);
    assert.equal(merged.length, 2);
    assert.equal(merged[0]?.title, "Г6 (правка)");
    assert.equal(merged[0]?.url, "/custom");
    assert.equal(merged[1]?.id, "other");
  });

  it("rejects unsafe cover paths for lab project assets", () => {
    assert.equal(isLabProjectCover("/projects/../etc/passwd.jpg"), false);
    assert.equal(isLabProjectCover("https://evil.example/x.jpg"), false);
    assert.equal(isLabProjectCover("/projects/nizhegorodets-g6/cover.jpg"), true);
  });
});
