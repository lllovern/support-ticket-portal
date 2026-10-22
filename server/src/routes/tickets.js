import { Router } from 'express';
import { STATUS_LABELS, canTransition } from '../domain/ticket.js';
import { HttpError, validate } from '../middleware/errors.js';
import {
  createTicketSchema,
  idParamSchema,
  listQuerySchema,
  updateTicketSchema,
} from '../validation/ticketSchemas.js';

export function ticketRoutes(tickets) {
  const router = Router();

  function findOr404(rawId) {
    const id = validate(idParamSchema, rawId);
    const ticket = tickets.findById(id);
    if (!ticket) throw new HttpError(404, `Ticket ${id} not found.`);
    return ticket;
  }

  // GET /api/tickets?status=OPEN&priority=HIGH
  router.get('/', (req, res) => {
    const filters = validate(listQuerySchema, req.query);
    res.json(tickets.list(filters));
  });

  // GET /api/tickets/:id
  router.get('/:id', (req, res) => {
    res.json(findOr404(req.params.id));
  });

  // POST /api/tickets  -> new tickets always start as OPEN
  router.post('/', (req, res) => {
    const input = validate(createTicketSchema, req.body ?? {});
    const ticket = tickets.create(input);
    res.status(201).location(`/api/tickets/${ticket.id}`).json(ticket);
  });

  // PATCH /api/tickets/:id  -> partial update; status changes must follow the transition rules
  router.patch('/:id', (req, res) => {
    const current = findOr404(req.params.id);
    const changes = validate(updateTicketSchema, req.body ?? {});

    if (changes.status && changes.status !== current.status && !canTransition(current.status, changes.status)) {
      throw new HttpError(
        409,
        `A ticket can’t move from ${STATUS_LABELS[current.status]} to ${STATUS_LABELS[changes.status]}.`
      );
    }

    res.json(tickets.update(current.id, changes));
  });

  // DELETE /api/tickets/:id
  router.delete('/:id', (req, res) => {
    const ticket = findOr404(req.params.id);
    tickets.remove(ticket.id);
    res.status(204).end();
  });

  return router;
}
