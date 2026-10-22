# Support Desk – client

React + Vite frontend for the Internal Support Ticket Portal.

## Run

```bash
cd client
cp .env.example .env     # optional: defaults work if the API runs on :3001
npm install
npm run dev              # http://localhost:5173
npm test                 # unit + component tests (Vitest)
```

The dev server proxies `/api/*` to `API_PROXY_TARGET` (default `http://localhost:3001`), so start the API first.

## Structure

```
src/
  api/tickets.js          all HTTP calls + ApiError
  constants.js            statuses, priorities, status transition rules
  validation/             Zod schema mirrored from the server
  context/FlashContext    success messages that survive navigation
  components/             form, filters, badges, loading/empty/error views
  pages/                  list, new ticket, ticket detail, 404
```

## API contract the client expects

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/api/tickets?status=&priority=` | – | 200, array of tickets |
| GET | `/api/tickets/:id` | – | 200, ticket |
| POST | `/api/tickets` | `{ title, description, priority, requesterName }` | 201, created ticket |
| PATCH | `/api/tickets/:id` | `{ status }` | 200, updated ticket |
| DELETE | `/api/tickets/:id` | – | 204 |

Values: `status` is `OPEN | IN_PROGRESS | RESOLVED`; `priority` is `LOW | MEDIUM | HIGH`.

Errors return `{ "error": "message", "details": { "field": "message" } }`.
`details` is used for 400 validation errors and is optional otherwise. A 404 on the detail page shows "Ticket not found".

## Status rules

Open → In Progress → Resolved. In Progress can move back to Open, and Resolved can be reopened.
Open cannot jump straight to Resolved. The client only shows valid moves; the server must enforce them.
