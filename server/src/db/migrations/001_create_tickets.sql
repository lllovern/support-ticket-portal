CREATE TABLE tickets (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT    NOT NULL,
  description    TEXT    NOT NULL,
  priority       TEXT    NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  status         TEXT    NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
  requester_name TEXT    NOT NULL,
  created_at     TEXT    NOT NULL,
  updated_at     TEXT    NOT NULL
);

CREATE INDEX idx_tickets_status   ON tickets (status);
CREATE INDEX idx_tickets_priority ON tickets (priority);
