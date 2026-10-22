import { PRIORITY_LABELS, STATUS_LABELS } from '../constants.js';

const toClass = (value = '') => value.toLowerCase().replace(/_/g, '-');

export function StatusBadge({ status }) {
  return (
    <span className={`badge badge--status badge--${toClass(status)}`}>
      <span className="sr-only">Status: </span>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`badge badge--priority badge--priority-${toClass(priority)}`}>
      <span className="sr-only">Priority: </span>
      {PRIORITY_LABELS[priority] ?? priority}
    </span>
  );
}
