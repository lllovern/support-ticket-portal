import { PRIORITIES, PRIORITY_LABELS, STATUSES, STATUS_LABELS } from '../constants.js';

export default function TicketFilters({ status, priority, onChange, onClear }) {
  const hasFilters = Boolean(status || priority);

  return (
    <div className="filters" role="group" aria-label="Filter tickets">
      <div className="field field--inline">
        <label htmlFor="filter-status">Status</label>
        <select
          id="filter-status"
          value={status}
          onChange={(e) => onChange('status', e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="field field--inline">
        <label htmlFor="filter-priority">Priority</label>
        <select
          id="filter-priority"
          value={priority}
          onChange={(e) => onChange('priority', e.target.value)}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button type="button" className="button button--ghost" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}
