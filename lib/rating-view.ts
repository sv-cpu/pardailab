import { sortModels } from "@/lib/content/models";
import { ratingLeaders } from "@/lib/scores";
import type { RatedModel } from "@/lib/types";

export function ratingPeriod(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  const month = new Intl.DateTimeFormat("ru-RU", { month: "long", timeZone: "UTC" }).format(date);
  const year = new Intl.DateTimeFormat("ru-RU", { year: "numeric", timeZone: "UTC" }).format(date);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${year.replace(/\s*г\.?$/, "")}`;
}

export function modelTitle(model: { name: string; versionName?: string }) {
  const version = model.versionName?.trim();
  if (!version) return model.name;
  return version.toLocaleLowerCase("ru").startsWith(model.name.trim().toLocaleLowerCase("ru"))
    ? version
    : `${model.name.trim()} ${version}`;
}

/** Выпуск внутри линейки. Если имя версии уже содержит семейство, наружу выходит только то, что отличает выпуск. */
export function modelRelease(model: { name: string; versionName?: string }) {
  const version = model.versionName?.trim() ?? "";
  const family = model.name.trim();
  if (!version || version.toLocaleLowerCase("ru") === family.toLocaleLowerCase("ru")) return "";
  const lowerFamily = family.toLocaleLowerCase("ru");
  const lowerVersion = version.toLocaleLowerCase("ru");
  if (lowerVersion.startsWith(lowerFamily) && /[\s-]/.test(version.charAt(family.length) || "")) {
    const rest = version.slice(family.length).trim().replace(/^[-–]\s*/, "");
    if (rest && !/^\d/.test(rest)) return rest;
  }
  return version;
}

export function topTen(models: RatedModel[]) {
  return sortModels(models.filter((model) => model.inRating !== false)).slice(0, 10);
}

export function categoryLeaders(models: RatedModel[]) {
  return ratingLeaders.map(([key, label]) => {
    const leader = [...models].sort(
      (a, b) => b.scores[key] - a.scores[key] || b.scores.overall - a.scores.overall || a.name.localeCompare(b.name, "ru"),
    )[0];
    return { key, label, model: leader };
  });
}
