import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIGRATIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

/**
 * Applies every .sql file in db/migrations that hasn't run yet, in filename order.
 * Applied files are recorded in the schema_migrations table, so this is safe to run on every start.
 */
export function runMigrations(db) { // applies every pending migration in the db/migrations directory
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name       TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`);

  const applied = new Set( // fetches the names of already applied migrations
    db.prepare('SELECT name FROM schema_migrations').all().map((row) => row.name)
  );

  const pending = fs // lists all .sql files in the migrations directory that haven't been applied yet
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql') && !applied.has(file))
    .sort();

  const record = db.prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)'); // prepares a statement to record applied migrations

  for (const file of pending) { // applies each pending migration file in order
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    db.transaction(() => {
      db.exec(sql);
      record.run(file, new Date().toISOString());
    })();
  }

  return pending;
}
