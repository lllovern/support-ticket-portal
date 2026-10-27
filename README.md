# Internal Support Ticket Portal

A simple full-stack app where employees raise support tickets and the support team tracks them from Open to Resolved.

- **Frontend:** React 18 + Vite, React Router, Zod
- **Backend:** Node.js + Express, Zod
- **Database:** SQLite via better-sqlite3, with a SQL migration
- **Tests:** Vitest, React Testing Library, Supertest

## Prerequisites

- Node.js 20 or newer (developed on Node 26)
- npm (comes with Node)

No database server is needed. SQLite stores everything in a single file that is created automatically.

## Setup and run

Run the backend and frontend in two terminals. Start the backend first.

**Terminal 1: backend**

```bash
cd server
npm install
cp .env.example .env        # Windows PowerShell: copy .env.example .env
npm run db:migrate          # creates server/data/tickets.db and the tickets table
npm run db:seed             # adds 4 sample tickets
npm run dev                 # API on http://localhost:3001
```

**Terminal 2: frontend**

```bash
cd client
npm install
npm run dev                 # app on http://localhost:5173
```

Open http://localhost:5173. The Vite dev server forwards `/api` requests to the backend, so no CORS setup is needed in development.

The client's `.env` is optional. Copy `client/.env.example` only if the API runs on a different port.

## Running tests

```bash
cd server && npm test       # 25 tests: API endpoints, validation, status rules, persistence
cd client && npm test       # 16 tests: form validation, API client errors, status rules
```

Server tests use an in-memory database, so they never touch the local data.

## Project structure

```
client/                 React app (see client/README.md)
  src/api/              all HTTP calls in one place
  src/components/       form, filters, badges, loading/empty/error views
  src/pages/            ticket list, new ticket, ticket detail
server/                 Express API (see server/README.md)
  src/routes/           HTTP handlers
  src/validation/       Zod schemas (source of truth for validation)
  src/repositories/     all SQL
  src/domain/           statuses, priorities and transition rules
  src/db/               connection, migration runner, migrations/*.sql, seed
```

## API summary

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/api/tickets?status=&priority=` | 200 | 400 |
| GET | `/api/tickets/:id` | 200 | 400, 404 |
| POST | `/api/tickets` | 201 | 400 |
| PATCH | `/api/tickets/:id` | 200 | 400, 404, 409 |
| DELETE | `/api/tickets/:id` | 204 | 400, 404 |

Errors are returned as `{ "error": "...", "details": { "field": "message" } }`. Full details are in `server/README.md`.

## Status rules

| From | Allowed moves |
|---|---|
| Open | In Progress |
| In Progress | Resolved, or back to Open |
| Resolved | Open (reopen) |

New tickets always start as Open. Open cannot go straight to Resolved, because someone should pick up a ticket before closing it. The server rejects disallowed moves with **409 Conflict**, and the frontend only shows buttons for valid moves.

## Assumptions

- The portal is used by a single support team, such as an IT helpdesk. Any employee can raise a ticket, and the support team handles all of them.
- There is no login, so the requester types their name and anyone with access can update or delete tickets.
- Priorities are Low, Medium and High.
- Deleting a ticket is permanent and asks for confirmation first.

## Decisions and trade-offs

- **SQLite instead of Postgres.** Reviewers can run the project with no database server. In production I'd use Postgres; the SQL lives in one repository file, so switching is contained.
- **Plain SQL with better-sqlite3 instead of an ORM.** It's fewer tools to set up, and the queries are easy to read and review. The trade-off is writing my own small migration runner.
- **Validation on both sides.** The server's Zod schemas are the source of truth. The client mirrors the same rules for instant feedback and also shows the server's field errors if they disagree.
- **Filters stored in the URL** (`?status=OPEN&priority=HIGH`), so they survive a refresh and can be shared as a link.
- **No state management library.** The app is small enough for React state plus one context for success messages.

## Known limitations

- No authentication or roles.
- No pagination or search. The list loads every matching ticket.
- Title, description and priority can be changed through the API (`PATCH`), but the UI only changes status.
- The status rules are duplicated in client and server constants and must be kept in sync by hand.
- No end-to-end browser tests.

## What I'd do next

1. **Route tickets by department.**
   At the moment, anyone can pick up and resolve any ticket, even one meant for another
   team. I'd add a `category` field (for example IT, HR or Facilities) with a matching
   filter, so each ticket goes to the team that can actually help.

2. **Add authentication and roles.**
   In a large organisation like Gamuda, access control matters. With logins and roles,
   only the support team could change a ticket's status, and requesters would only see
   their own tickets.

3. **Add an `assignee` field.**
   Giving every ticket a clear owner avoids confusion about who is handling it, and stops
   two people from working on the same request without knowing.

4. **Add pagination and search.**
   A real helpdesk builds up hundreds of tickets over time. Pagination would keep the list
   fast, and a search bar would make it much quicker to find a specific ticket.

5. **Add Docker Compose and end-to-end tests.**
   Docker Compose would let anyone start the whole project with one command. Playwright
   tests would check the full flow in a real browser, so changes don't break it without
   anyone noticing.

## Time spent

About _[2]_ hours.

## Use of AI tools

I used AI in helping me build the foundation of the app and the logic to help with the efficiency of the project. I also went to AI helped to provide a better option for the tech stack to use in this scenario. 
