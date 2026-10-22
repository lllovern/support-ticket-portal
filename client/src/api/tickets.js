// All HTTP calls live here so components never build URLs or parse responses themselves.

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  constructor(message, status, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 means the request never reached the server
    this.details = details; // field -> message, for validation errors
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Can’t reach the server. Check that the API is running, then try again.', 0);
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.error || `The request failed with status ${response.status}.`,
      response.status,
      data?.details || {}
    );
  }

  return data;
}

export function getTickets(filters = {}, options = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return request(`/tickets${query ? `?${query}` : ''}`, options);
}

export function getTicket(id, options = {}) {
  return request(`/tickets/${encodeURIComponent(id)}`, options);
}

export function createTicket(ticket) {
  return request('/tickets', { method: 'POST', body: ticket });
}

export function updateTicketStatus(id, status) {
  return request(`/tickets/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } });
}

export function deleteTicket(id) {
  return request(`/tickets/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
