import type { ModelScores } from "@/lib/types";

export const scoreFields = [
  ["speed", "Скорость"],
  ["cost", "Стоимость"],
  ["quality", "Качество"],
  ["russian", "Русский язык"],
  ["code", "Код"],
  ["agents", "Агенты"],
  ["documents", "Документы"],
  ["context", "Длинный контекст"],
] as const satisfies ReadonlyArray<readonly [keyof ModelScores, string]>;

/** Доля каждой оси в итоге. Сумма равна 1. */
export const overallWeights: Record<keyof ModelScores, number> = {
  quality: 0.22,
  documents: 0.14,
  russian: 0.14,
  code: 0.12,
  agents: 0.12,
  context: 0.12,
  speed: 0.07,
  cost: 0.07,
};

export function overallScore(scores: ModelScores) {
  const sum = scoreFields.reduce((total, [key]) => total + scores[key] * overallWeights[key], 0);
  return Math.round(sum * 10) / 10;
}

export const costHint = "10 — бережнее к бюджету";
