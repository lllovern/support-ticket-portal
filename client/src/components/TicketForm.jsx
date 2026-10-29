import { useEffect, useState } from 'react';
import { PRIORITIES, PRIORITY_LABELS } from '../constants.js';
import { validateTicket } from '../validation/ticketSchema.js';

const EMPTY_VALUES = { title: '', description: '', priority: '', requesterName: '' };
const NO_ERRORS = {}; // the empty object is created once, outside the component, so every render reuses the same empty object.
// A new {} on each render would make the useEffect below run in an endless loop.
//It must be the same object so React doesn’t mistake every render for “new server errors,” which would make the effect run, update state, render again, and loop forever.

function Field({ id, label, error, hint, children }) {
  return (
    <div className={`field${error ? ' field--invalid' : ''}`}>
      <label htmlFor={id}>
        {label} <span className="required" aria-hidden="true">*</span>
      </label>
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Collects and validates a new ticket. It calls onSubmit(data) only with valid, trimmed data.
 * serverErrors (field -> message) come from a 400 response and are shown until that field is edited.
 */
export default function TicketForm({ onSubmit, submitting = false, serverErrors = NO_ERRORS }) {
  const [values, setValues] = useState(EMPTY_VALUES); // whats typed in each field
  const [errors, setErrors] = useState({}); // client side validation messages
  const [attempted, setAttempted] = useState(false); // whether the user has tried to submit the form
  const [editedSinceServer, setEditedSinceServer] = useState({}); // tracks which fields have been edited since the last server error

  useEffect(() => setEditedSinceServer({}), [serverErrors]);

  function handleChange(event) { // updates values and validation state as the user types
    const { name, value } = event.target;
    const next = { ...values, [name]: value };
    setValues(next);
    setEditedSinceServer((prev) => ({ ...prev, [name]: true }));
    // After the first submit attempt, re-validate as the user types so errors clear promptly.
    if (attempted) setErrors(validateTicket(next).errors);
  }

  function handleSubmit(event) { // validates the form and calls onSubmit if valid
    event.preventDefault();
    setAttempted(true);
    const { data, errors: nextErrors } = validateTicket(values);
    setErrors(nextErrors);
    if (data) onSubmit(data);
  }

  const errorFor = (name) => // returns the error message for a field, preferring client-side errors over server-side ones
    errors[name] || (!editedSinceServer[name] ? serverErrors[name] : undefined);

  const describedBy = (name, hasHint = false) => { // links each input to its error or hint text for user accessibility
    if (errorFor(name)) return `${name}-error`;
    return hasHint ? `${name}-hint` : undefined;
  };

  return ( //  turns off browser's default validation message and use mine instead
    <form className="ticket-form" onSubmit={handleSubmit} noValidate>
      <Field id="title" label="Title" error={errorFor('title')} hint="A short summary, like “VPN drops every hour”.">
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={handleChange}
          maxLength={120}
          aria-invalid={Boolean(errorFor('title'))}
          aria-describedby={describedBy('title', true)}
        />
      </Field>

      <Field
        id="description"
        label="Description"
        error={errorFor('description')}
        hint="What happened, what you expected, and any steps to reproduce it."
      >
        <textarea
          id="description"
          name="description"
          rows={6}
          value={values.description}
          onChange={handleChange}
          maxLength={5000}
          aria-invalid={Boolean(errorFor('description'))}
          aria-describedby={describedBy('description', true)}
        />
      </Field>

      <div className="form-row">
        <Field id="priority" label="Priority" error={errorFor('priority')}>
          <select
            id="priority"
            name="priority"
            value={values.priority}
            onChange={handleChange}
            aria-invalid={Boolean(errorFor('priority'))}
            aria-describedby={describedBy('priority')}
          >
            <option value="">Choose a priority</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </Field>

        <Field id="requesterName" label="Your name" error={errorFor('requesterName')}>
          <input
            id="requesterName"
            name="requesterName"
            type="text"
            autoComplete="name"
            value={values.requesterName}
            onChange={handleChange}
            maxLength={80}
            aria-invalid={Boolean(errorFor('requesterName'))}
            aria-describedby={describedBy('requesterName')}
          />
        </Field>
      </div>

      <div className="form-actions">
        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? 'Creating ticket…' : 'Create ticket'}
        </button>
      </div>
    </form>
  );
}
