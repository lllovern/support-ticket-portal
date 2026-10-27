import { config } from '../config.js';
import { openDatabase } from './connection.js';
import { runMigrations } from './migrate.js';

const db = openDatabase(config.databaseFile, { migrate: false }); // open the database without running migrations initially
const applied = runMigrations(db); // apply any pending migrations to the database

if (applied.length) {
  console.log(`Applied ${applied.length} migration(s): ${applied.join(', ')}`); // log the applied migrations
} else {
  console.log('Schema already up to date.'); // log if no migrations were applied 
}
console.log(`Database file: ${config.databaseFile}`); // log the database file being used
db.close();
