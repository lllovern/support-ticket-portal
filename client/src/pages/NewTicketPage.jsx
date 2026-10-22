import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createTicket } from '../api/tickets.js';
import TicketForm from '../components/TicketForm.jsx';
import { Alert } from '../components/StateViews.jsx';
import { useFlash } from '../context/FlashContext.jsx';

export default function NewTicketPage() {
  const navigate = useNavigate();
  const { showFlash } = useFlash();
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState(null);

  async function handleSubmit(data) {
    setSubmitting(true);
    setFormError(null);
    try {
      const ticket = await createTicket(data);
      showFlash(`Ticket #${ticket.id} created.`);
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      const details = err.details ?? {};
      setServerErrors(details);
      setFormError(
        err.status === 400 && Object.keys(details).length > 0
          ? 'Some fields need attention. Fix them and create the ticket again.'
          : err.message
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="page page--narrow">
      <Link to="/" className="back-link">
        Back to tickets
      </Link>
      <div className="page-header">
        <h1>New ticket</h1>
      </div>
      <p className="page-intro">Tell the support team what’s wrong. All fields are required.</p>

      {formError && <Alert>{formError}</Alert>}

      <div className="panel">
        <TicketForm onSubmit={handleSubmit} submitting={submitting} serverErrors={serverErrors} />
      </div>
    </div>
  );
}
