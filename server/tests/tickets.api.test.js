import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db/connection.js';

const validTicket = {
  title: 'Laptop won’t turn on',
  description: 'The power light blinks orange and nothing else happens.',
  priority: 'HIGH',
  requesterName: 'Aisha',
};

let db;
let app;

beforeEach(() => {
  db = openDatabase(':memory:'); // fresh, empty database for every test
  app = createApp({ db });
});

afterEach(() => db.close());

async function createTicket(overrides = {}) {
  const res = await request(app).post('/api/tickets').send({ ...validTicket, ...overrides });
  expect(res.status).toBe(201);
  return res.body;
}

describe('POST /api/tickets', () => {
  it('creates a ticket that starts as OPEN, with timestamps', async () => {
    const res = await request(app).post('/api/tickets').send(validTicket);

    expect(res.status).toBe(201);
    expect(res.headers.location).toBe(`/api/tickets/${res.body.id}`);
    expect(res.body).toMatchObject({ ...validTicket, status: 'OPEN' });
    expect(res.body.createdAt).toBeTruthy();
    expect(res.body.updatedAt).toBe(res.body.createdAt);
  });

  it('trims whitespace and ignores a client-supplied status', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ ...validTicket, title: '   Printer jammed   ', status: 'RESOLVED' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Printer jammed');
    expect(res.body.status).toBe('OPEN');
  });

  it('returns 400 with a message for each invalid field', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ title: 'ab', description: '', priority: 'URGENT' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed.');
    expect(Object.keys(res.body.details).sort()).toEqual(
      ['description', 'priority', 'requesterName', 'title'].sort()
    );
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Content-Type', 'application/json')
      .send('{"title": ');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/valid JSON/);
  });
});

describe('GET /api/tickets', () => {
  it('returns an empty list when there are no tickets', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('filters by status and priority', async () => {
    const high = await createTicket({ priority: 'HIGH' });
    await createTicket({ priority: 'LOW' });
    const started = await createTicket({ priority: 'HIGH' });
    await request(app).patch(`/api/tickets/${started.id}`).send({ status: 'IN_PROGRESS' });

    const res = await request(app).get('/api/tickets?status=OPEN&priority=HIGH');

    expect(res.status).toBe(200);
    expect(res.body.map((t) => t.id)).toEqual([high.id]);
  });

  it('rejects an unknown filter value with 400', async () => {
    const res = await request(app).get('/api/tickets?status=CLOSED');
    expect(res.status).toBe(400);
    expect(res.body.details.status).toMatch(/OPEN, IN_PROGRESS, RESOLVED/);
  });
});

describe('GET /api/tickets/:id', () => {
  it('returns the ticket', async () => {
    const created = await createTicket();
    const res = await request(app).get(`/api/tickets/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(created);
  });

  it('returns 404 for a ticket that does not exist', async () => {
    const res = await request(app).get('/api/tickets/999');
    expect(res.status).toBe(404);
  });

  it('returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/api/tickets/abc');
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/tickets/:id', () => {
  it('moves a ticket through the allowed statuses', async () => {
    const { id } = await createTicket();

    for (const status of ['IN_PROGRESS', 'RESOLVED', 'OPEN']) {
      const res = await request(app).patch(`/api/tickets/${id}`).send({ status });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(status);
    }
  });

  it('returns 409 for a disallowed move and leaves the ticket unchanged', async () => {
    const { id } = await createTicket();

    const res = await request(app).patch(`/api/tickets/${id}`).send({ status: 'RESOLVED' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/Open to Resolved/);
    const after = await request(app).get(`/api/tickets/${id}`);
    expect(after.body.status).toBe('OPEN');
  });

  it('updates other fields and validates them', async () => {
    const { id } = await createTicket();

    const ok = await request(app).patch(`/api/tickets/${id}`).send({ priority: 'LOW' });
    expect(ok.status).toBe(200);
    expect(ok.body.priority).toBe('LOW');

    const bad = await request(app).patch(`/api/tickets/${id}`).send({ title: 'x' });
    expect(bad.status).toBe(400);
    expect(bad.body.details.title).toBeTruthy();
  });

  it('returns 400 for an empty body and 404 for a missing ticket', async () => {
    const { id } = await createTicket();
    expect((await request(app).patch(`/api/tickets/${id}`).send({})).status).toBe(400);
    expect((await request(app).patch('/api/tickets/999').send({ status: 'OPEN' })).status).toBe(404);
  });
});

describe('DELETE /api/tickets/:id', () => {
  it('deletes the ticket and returns 204', async () => {
    const { id } = await createTicket();

    const res = await request(app).delete(`/api/tickets/${id}`);
    expect(res.status).toBe(204);
    expect((await request(app).get(`/api/tickets/${id}`)).status).toBe(404);
  });

  it('returns 404 when the ticket does not exist', async () => {
    expect((await request(app).delete('/api/tickets/999')).status).toBe(404);
  });
});

describe('persistence', () => {
  it('keeps tickets after the database is closed and reopened', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tickets-'));
    const file = path.join(dir, 'test.db');

    const first = openDatabase(file);
    const created = await request(createApp({ db: first })).post('/api/tickets').send(validTicket);
    first.close();

    const second = openDatabase(file);
    const res = await request(createApp({ db: second })).get(`/api/tickets/${created.body.id}`);
    second.close();
    fs.rmSync(dir, { recursive: true, force: true });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(validTicket.title);
  });
});

describe('unknown routes', () => {
  it('returns JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
  });
});
