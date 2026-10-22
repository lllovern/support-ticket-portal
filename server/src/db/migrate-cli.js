import { config } from '../config.js';
import { openDatabase } from './connection.js';
import { runMigrations } from './migrate.js';

const db = openDatabase(config.databaseFile, { migrate: false });
const applied = runMigrations(db);

if (applied.length) {
  console.log(`Applied ${applied.length} migration(s): ${applied.join(', ')}`);
} else {
  console.log('Schema already up to date.');
}
console.log(`Database file: ${config.databaseFile}`);
db.close();
