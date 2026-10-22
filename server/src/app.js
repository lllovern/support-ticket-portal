import express from 'express';
import cors from 'cors';
import { createTicketRepository } from './repositories/ticketRepository.js';
import { ticketRoutes } from './routes/tickets.js';
import { errorHandler, notFound } from './middleware/errors.js';

/** Builds the Express app around a database handle, so tests can pass an in-memory database. */
export function createApp({ db, corsOrigin } = {}) {
  const app = express();
  const tickets = createTicketRepository(db);

  if (corsOrigin) app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/tickets', ticketRoutes(tickets));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
