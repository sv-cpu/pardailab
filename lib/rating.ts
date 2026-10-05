import { getDb } from "@/lib/db";

const updatedKey = "rating_updated";
const noteKey = "rating_note";

export function ratingStamp(db = getDb()) {
  const read = (key: string) =>
    (db.prepare("SELECT value FROM meta WHERE key = ?").get(key) as { value: string } | undefined)?.value;
  return {
    updated: read(updatedKey) || "2026-10-01",
    note: read(noteKey) || "",
  };
}

export function saveRatingStamp(updated: string, note: string, db = getDb()) {
  const upsert = db.prepare(
    "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );
  upsert.run(updatedKey, updated);
  upsert.run(noteKey, note);
}
