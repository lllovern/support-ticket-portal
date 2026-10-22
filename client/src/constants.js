// Shared ticket vocabulary. Keep these values identical to the server's.

export const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

export const STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
};

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

export const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

/**
 * Status rules:
 *   Open        -> In Progress
 *   In Progress -> Resolved, or back to Open
 *   Resolved    -> Open (reopen)
 * A ticket cannot jump straight from Open to Resolved.
 * The server enforces the same rules; the client only uses them to show valid actions.
 */
export const ALLOWED_TRANSITIONS = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED', 'OPEN'],
  RESOLVED: ['OPEN'],
};

export function canTransition(from, to) {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function nextStatuses(current) {
  return ALLOWED_TRANSITIONS[current] ?? [];
}

/** Button text for each move, named by what the user is doing. */
export function transitionLabel(from, to) {
  if (to === 'IN_PROGRESS') return 'Start work';
  if (to === 'RESOLVED') return 'Mark as resolved';
  if (to === 'OPEN') return from === 'RESOLVED' ? 'Reopen ticket' : 'Move back to Open';
  return `Move to ${STATUS_LABELS[to] ?? to}`;
}
