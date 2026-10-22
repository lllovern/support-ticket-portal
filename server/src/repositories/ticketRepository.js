// All SQL lives here. Routes call these functions and never touch the database directly.

const COLUMNS = {
  title: 'title',
  description: 'description',
  priority: 'priority',
  status: 'status',
  requesterName: 'requester_name',
};

function toTicket(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    requesterName: row.requester_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createTicketRepository(db, { now = () => new Date().toISOString() } = {}) {
  const findByIdStmt = db.prepare('SELECT * FROM tickets WHERE id = ?');

  function findById(id) {
    return toTicket(findByIdStmt.get(id));
  }

  function list({ status, priority } = {}) {
    const conditions = [];
    const params = {};
    if (status) {
      conditions.push('status = @status');
      params.status = status;
    }
    if (priority) {
      conditions.push('priority = @priority');
      params.priority = priority;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return db
      .prepare(`SELECT * FROM tickets ${where} ORDER BY created_at DESC, id DESC`)
      .all(params)
      .map(toTicket);
  }

  function create({ title, description, priority, requesterName }) {
    const timestamp = now();
    const result = db
      .prepare(
        `INSERT INTO tickets (title, description, priority, status, requester_name, created_at, updated_at)
         VALUES (?, ?, ?, 'OPEN', ?, ?, ?)`
      )
      .run(title, description, priority, requesterName, timestamp, timestamp);
    return findById(result.lastInsertRowid);
  }

  /** Updates only the given fields. Returns the updated ticket, or null if it doesn't exist. */
  function update(id, changes) {
    const fields = Object.keys(changes).filter((key) => key in COLUMNS);
    if (fields.length === 0) return findById(id);

    const assignments = fields.map((key) => `${COLUMNS[key]} = @${key}`).join(', ');
    const result = db
      .prepare(`UPDATE tickets SET ${assignments}, updated_at = @updatedAt WHERE id = @id`)
      .run({ ...pick(changes, fields), updatedAt: now(), id });

    return result.changes === 0 ? null : findById(id);
  }

  /** Returns true if a ticket was deleted. */
  function remove(id) {
    return db.prepare('DELETE FROM tickets WHERE id = ?').run(id).changes > 0;
  }

  return { list, findById, create, update, remove };
}

function pick(object, keys) {
  return Object.fromEntries(keys.map((key) => [key, object[key]]));
}
