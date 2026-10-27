import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTickets } from '../api/tickets.js';
import TicketFilters from '../components/TicketFilters.jsx';
import { PriorityBadge, StatusBadge } from '../components/Badges.jsx';
import { EmptyState, ErrorState, Loading } from '../components/StateViews.jsx';
import { formatDate } from '../utils/format.js';

export default function TicketListPage() {
  // Filters live in the URL (?status=OPEN&priority=HIGH) so they survive refresh and can be shared.
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const priority = searchParams.get('priority') ?? '';

  const [tickets, setTickets] = useState([]); // the list of tickets fetched from the server
  const [loading, setLoading] = useState(true);// whether the tickets are currently being loaded from the server
  const [error, setError] = useState(null); // any error that occurred while fetching tickets
  const [reloadKey, setReloadKey] = useState(0); // Triggers another ticket fetch when the user retries after an error.
  useEffect(() => {
    const controller = new AbortController(); // Lets us cancel this request if the page changes or a newer request starts. 
    setLoading(true);
    setError(null);

    getTickets({ status, priority }, { signal: controller.signal })
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // a newer request replaced this one
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [status, priority, reloadKey]);

  function handleFilterChange(name, value) { // updates the URL search params when a filter changes
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next);
  }

  const clearFilters = () => setSearchParams({});
  const hasFilters = Boolean(status || priority);

  let content;
  if (loading) {
    content = <Loading label="Loading tickets…" />;
  } else if (error) {
    content = (
      <ErrorState
        title="Couldn’t load tickets"
        message={error}
        onRetry={() => setReloadKey((k) => k + 1)}
      />
    );
  } else if (tickets.length === 0) {
    content = hasFilters ? (
      <EmptyState title="No tickets match these filters">
        <button type="button" className="button button--secondary" onClick={clearFilters}>
          Clear filters
        </button>
      </EmptyState>
    ) : (
      <EmptyState title="No tickets yet">
        <p>When someone reports a problem, it shows up here.</p>
        <Link to="/tickets/new" className="button button--primary">
          Create the first ticket
        </Link>
      </EmptyState>
    );
  } else {
    content = (
      <ul className="ticket-list">
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <Link
              to={`/tickets/${ticket.id}`}
              className={`ticket-row ticket-row--${ticket.priority?.toLowerCase()}`}
            >
              <div className="ticket-row__main">
                <span className="ticket-id">#{ticket.id}</span>
                <span className="ticket-row__title">{ticket.title}</span>
                <span className="ticket-row__meta">
                  <span>{ticket.requesterName}</span>
                  <span>Updated {formatDate(ticket.updatedAt)}</span>
                </span>
              </div>
              <div className="ticket-row__badges">
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tickets</h1>
        {!loading && !error && (
          <p className="page-header__count">
            {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
            {hasFilters ? ' match' : ''}
          </p>
        )}
      </div>

      <TicketFilters
        status={status}
        priority={priority}
        onChange={handleFilterChange}
        onClear={clearFilters}
      />

      {content}
    </div>
  );
}
