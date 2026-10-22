import { z } from 'zod';
import { PRIORITIES, STATUSES } from '../domain/ticket.js';

// The server is the source of truth for validation. The client mirrors these rules for fast feedback.

const title = z
  .string({ required_error: 'Title is required.', invalid_type_error: 'Title must be text.' })
  .trim()
  .min(3, 'Title must be at least 3 characters.')
  .max(120, 'Title must be 120 characters or fewer.');

const description = z
  .string({ required_error: 'Description is required.', invalid_type_error: 'Description must be text.' })
  .trim()
  .min(10, 'Description must be at least 10 characters.')
  .max(5000, 'Description must be 5000 characters or fewer.');

const priority = z.enum(PRIORITIES, {
  errorMap: () => ({ message: `Priority must be one of: ${PRIORITIES.join(', ')}.` }),
});

const status = z.enum(STATUSES, {
  errorMap: () => ({ message: `Status must be one of: ${STATUSES.join(', ')}.` }),
});

const requesterName = z
  .string({ required_error: 'Name is required.', invalid_type_error: 'Name must be text.' })
  .trim()
  .min(2, 'Name must be at least 2 characters.')
  .max(80, 'Name must be 80 characters or fewer.');

export const createTicketSchema = z.object({ title, description, priority, requesterName });

// PATCH accepts any subset of editable fields, but at least one.
export const updateTicketSchema = z
  .object({
    title: title.optional(),
    description: description.optional(),
    priority: priority.optional(),
    status: status.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Provide at least one field to update: title, description, priority or status.',
  });

export const listQuerySchema = z.object({
  status: status.optional(),
  priority: priority.optional(),
});

export const idParamSchema = z.coerce
  .number({ invalid_type_error: 'Ticket id must be a number.' })
  .int('Ticket id must be a whole number.')
  .positive('Ticket id must be a positive number.');
