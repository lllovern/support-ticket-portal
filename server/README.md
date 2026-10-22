# Support Desk – server

Express REST API with a SQLite database (better-sqlite3) and Zod validation.

## Run

```bash
cd server
npm install
cp .env.example .env     # Windows PowerShell: copy .env.example .env
npm run db:migrate       # creates data/tickets.db and the tickets table
npm run db:seed          # adds 4 sample tickets (skipped if tickets already exist)
npm run dev              # http://localhost:3001, restarts on file changes
npm test                 # API + rule tests against an in-memory database
```

The server also applies pending migrations on start, so `db:migrate` is only needed to set up the database ahead of time.

## Structure

```
src/
  index.js                     starts the server
  app.js                       builds the Express app (tests create it with an in-memory DB)
  config.js                    reads .env
  domain/ticket.js             statuses, priorities and status transition rules
  validation/ticketSchemas.js  Zod schemas for request bodies, query and id
  routes/tickets.js            HTTP handlers
  repositories/                all SQL for tickets
  middleware/errors.js         HttpError, 404 and JSON error handler
  db/                          connection, migration runner, migrations/*.sql, seed
tests/                         Vitest + Supertest
```

## Endpoints

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/api/tickets?status=&priority=` | 200 list (newest first) | 400 invalid filter |
| GET | `/api/tickets/:id` | 200 ticket | 400 bad id, 404 |
| POST | `/api/tickets` | 201 ticket + `Location` header | 400 validation |
| PATCH | `/api/tickets/:id` | 200 ticket | 400 validation, 404, 409 disallowed status move |
| DELETE | `/api/tickets/:id` | 204 | 400 bad id, 404 |
| GET | `/api/health` | 200 `{ "status": "ok" }` | – |

POST takes `title`, `description`, `priority` and `requesterName`; new tickets always start as `OPEN`.
PATCH takes any of `title`, `description`, `priority` and `status`.

Errors look like `{ "error": "Validation failed.", "details": { "title": "Title must be at least 3 characters." } }`.

## Status rules

Open → In Progress → Resolved. In Progress can go back to Open, and Resolved can be reopened.
Open → Resolved is rejected with 409, because someone should pick a ticket up before closing it.
The seed script sets statuses directly so the sample data covers every state.
