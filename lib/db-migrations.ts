import { ensureBenchmarks } from "@/lib/benchmarks";
import { ensureResumes } from "@/lib/resumes";
import { ensureRubrics } from "@/lib/rubrics";
import { ensureUsers } from "@/lib/users";

const CURRENT_SCHEMA_VERSION = 3;

export function applyDatabaseMigrations(db: { exec: (sql: string) => void; prepare: (sql: string) => { get: (...params: unknown[]) => unknown; run: (...params: unknown[]) => unknown } }) {
  const versionRow = db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value?: string } | undefined;
  const currentVersion = versionRow ? Number(versionRow.value ?? 0) : 0;

  if (currentVersion < CURRENT_SCHEMA_VERSION) {
    db.exec("BEGIN");
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
      db.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('schema_version', ?)").run(String(CURRENT_SCHEMA_VERSION));
      db.prepare("UPDATE meta SET value = ? WHERE key = 'schema_version'").run(String(CURRENT_SCHEMA_VERSION));
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  ensureRubrics(db as never);
  ensureUsers(db as never);
  ensureBenchmarks(db as never);
  ensureResumes(db as never);
}
