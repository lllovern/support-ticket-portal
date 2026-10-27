import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteTicket, getTicket, updateTicketStatus } from '../api/tickets.js';
import { PriorityBadge, StatusBadge } from '../components/Badges.jsx';
import { Alert, EmptyState, ErrorState, Loading } from '../components/StateViews.jsx';
import { useFlash } from '../context/FlashContext.jsx';
import { STATUS_LABELS, nextStatuses, transitionLabel } from '../constants.js';
import { formatDate } from '../utils/format.js';

export default function TicketDetailPage() {
  const { id } = useParams(); // get the ticket ID from the URL parameters
  const navigate = useNavigate();
  const { showFlash } = useFlash();

  const [ticket, setTicket] = useState(null); // the ticket data fetched from the server
  const [loading, setLoading] = useState(true); // whether the ticket is currently being loaded
  const [loadError, setLoadError] = useState(null); // any error that occurred while loading the ticket
  const [reloadKey, setReloadKey] = useState(0); // triggers a reload of the ticket when incremented

  const [pendingStatus, setPendingStatus] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);

    getTicket(id, { signal: controller.signal })
      .then((data) => {
        setTicket(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setLoadError(err);
        setLoading(false);
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  async function handleStatusChange(status) { // handles changing the ticket status
    setPendingStatus(status);
    setActionError(null);
    try {
      const updated = await updateTicketStatus(id, status); // send a request to update the ticket status
      setTicket(updated);
      showFlash(`Status changed to ${STATUS_LABELS[status]}.`);
    } catch (err) { // on error shows it in an alert within the page
      setActionError(err.message);
    } finally {
      setPendingStatus(null);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ticket #${ticket.id}? This can’t be undone.`)) return; // confirm with the user before deleting the ticket
    setDeleting(true);
    setActionError(null);
    try {
      await deleteTicket(id); // send a request to delete the ticket
      showFlash(`Ticket #${ticket.id} deleted.`);
      navigate('/');
    } catch (err) {
      setActionError(err.message);
      setDeleting(false);
    }
  }

  if (loading) return <Loading label="Loading ticket…" />;

  if (loadError) {
    if (loadError.status === 404) {
      return (
        <EmptyState title="Ticket not found">
          <p>Ticket #{id} doesn’t exist. It may have been deleted.</p>
          <Link to="/" className="button button--secondary">
            Back to tickets
          </Link>
        </EmptyState>
      );
    }
    return (
      <ErrorState
        title="Couldn’t load this ticket"
        message={loadError.message}
        onRetry={() => setReloadKey((k) => k + 1)}
      />
    );
  }

  const busy = Boolean(pendingStatus) || deleting; // whether any action is currently in progress
  const moves = nextStatuses(ticket.status);

  return (
    <div className="page">
      <Link to="/" className="back-link">
        Back to tickets
      </Link>

      <div className="detail-layout">
        <article className="panel ticket-detail">
          <header className="ticket-detail__header">
            <span className="ticket-id">#{ticket.id}</span>
            <h1>{ticket.title}</h1>
            <div className="ticket-detail__badges">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </header>

          <h2 className="section-title">Description</h2>
          <p className="ticket-detail__description">{ticket.description}</p>
        </article>

        <aside className="detail-sidebar">
          <section className="panel">
            <h2 className="section-title">Details</h2>
            <dl className="meta-list">
              <div>
                <dt>Requester</dt>
                <dd>{ticket.requesterName}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(ticket.createdAt)}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{formatDate(ticket.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <h2 className="section-title">Status</h2>
            <p className="current-status">
              Currently <StatusBadge status={ticket.status} />
            </p>
            <div className="button-stack">
              {moves.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`button ${status === 'OPEN' ? 'button--secondary' : 'button--primary'}`}
                  disabled={busy}
                  onClick={() => handleStatusChange(status)}
                >
                  {pendingStatus === status ? 'Updating…' : transitionLabel(ticket.status, status)}
                </button>
              ))}
            </div>
            <p className="field__hint">
              Tickets move from Open to In Progress to Resolved. Resolved tickets can be reopened.
            </p>

            {actionError && <Alert>{actionError}</Alert>}

            <div className="danger-zone">
              <button
                type="button"
                className="button button--danger"
                disabled={busy}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting…' : 'Delete ticket'}
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
