// Shared loading / empty / error / alert views so every page handles states the same way.

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="state state--loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="state state--empty">
      <h2 className="state__title">{title}</h2>
      {children && <div className="state__body">{children}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Couldn’t load this page', message, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <h2 className="state__title">{title}</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="button button--secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Alert({ type = 'error', children }) {
  return (
    <div className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
