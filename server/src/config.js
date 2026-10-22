import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 3001,
  databaseFile: process.env.DATABASE_FILE || './data/tickets.db',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
