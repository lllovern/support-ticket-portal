import { z } from 'zod';
import { PRIORITIES } from '../constants.js';

// Client-side copy of the server's rules. Gives fast feedback; the server stays the source of truth.
export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(120, 'Title must be 120 characters or fewer.'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters.')
    .max(5000, 'Description must be 5000 characters or fewer.'),
  priority: z.enum(PRIORITIES, {
    errorMap: () => ({ message: 'Choose a priority.' }),
  }),
  requesterName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(80, 'Name must be 80 characters or fewer.'),
});

/**  returns either the clean data or an object of error messages, one per field */
export function validateTicket(values) {
  const result = createTicketSchema.safeParse(values);
  if (result.success) return { data: result.data, errors: {} };

  const errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { data: null, errors };
}
