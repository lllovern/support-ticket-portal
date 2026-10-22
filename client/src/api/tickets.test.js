import { ApiError, createTicket, getTickets } from './tickets.js';

const jsonResponse = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => vi.unstubAllGlobals());

describe('tickets API client', () => {
  it('sends only the filters that are set', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([], 200));
    vi.stubGlobal('fetch', fetchMock);

    await getTickets({ status: 'OPEN', priority: '' });

    expect(fetchMock.mock.calls[0][0]).toBe('/api/tickets?status=OPEN');
  });

  it('turns a 400 response into an ApiError with field details', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ error: 'Validation failed', details: { title: 'Title is required.' } }, 400)
      )
    );

    const error = await createTicket({}).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.details).toEqual({ title: 'Title is required.' });
  });

  it('reports a clear message when the server is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const error = await getTickets().catch((e) => e);

    expect(error.status).toBe(0);
    expect(error.message).toMatch(/can’t reach the server/i);
  });
});
