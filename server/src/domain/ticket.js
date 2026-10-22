// Ticket vocabulary and business rules. Keep in sync with client/src/constants.js.

export const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

export const STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
};

/**
 * Status rules:
 *   Open        -> In Progress
 *   In Progress -> Resolved, or back to Open
 *   Resolved    -> Open (reopen)
 * Open cannot jump straight to Resolved: someone has to pick the ticket up first.
 */
export const ALLOWED_TRANSITIONS = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED', 'OPEN'],
  RESOLVED: ['OPEN'],
};

export function canTransition(from, to) {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
