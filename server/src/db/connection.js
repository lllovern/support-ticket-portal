import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { runMigrations } from './migrate.js';

/**
 * Opens the SQLite database (use ':memory:' in tests).
 * By default it also applies any pending migrations, so the schema is always up to date.
 */
export function openDatabase(file, { migrate = true } = {}) {
  if (file !== ':memory:') {
    fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  }
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  if (migrate) runMigrations(db); // apply any pending migrations to keep the schema up to date
  return db;
}
