import { getDb } from "@/lib/db";

const updatedKey = "rating_updated";
const nextKey = "rating_next";

export function ratingStamp(db = getDb()) {
  const read = (key: string) =>
    (db.prepare("SELECT value FROM meta WHERE key = ?").get(key) as { value: string } | undefined)?.value;
  return {
    updated: read(updatedKey) || "2026-10-01",
    nextUpdate: read(nextKey) || "",
  };
}

export function saveRatingStamp(updated: string, nextUpdate: string, db = getDb()) {
  const upsert = db.prepare(
    "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );
  upsert.run(updatedKey, updated);
  upsert.run(nextKey, nextUpdate);
}
