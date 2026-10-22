import { config } from './config.js';
import { openDatabase } from './db/connection.js';
import { createApp } from './app.js';

const db = openDatabase(config.databaseFile);
const app = createApp({ db, corsOrigin: config.corsOrigin });

const server = app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
