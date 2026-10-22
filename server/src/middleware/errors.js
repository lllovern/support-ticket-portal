import { ZodError } from 'zod';

/** An error with an HTTP status, thrown by route handlers and turned into JSON by errorHandler. */
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Converts a ZodError into { field: firstMessage }. Errors not tied to a field go under "_form". */
export function zodDetails(error) {
  const details = {};
  for (const issue of error.issues) {
    const field = issue.path[0] ?? '_form';
    if (!details[field]) details[field] = issue.message;
  }
  return details;
}

/** Parses with a Zod schema, or throws a 400 HttpError listing each invalid field. */
export function validate(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new HttpError(400, 'Validation failed.', zodDetails(result.error));
  }
  return result.data;
}

export function notFound(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}.` });
}

// Express recognises error handlers by their four arguments, so `next` must stay.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details && { details: err.details }) });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed.', details: zodDetails(err) });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Something went wrong on the server. Try again later.' });
}
