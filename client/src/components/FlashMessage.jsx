import { useFlash } from '../context/FlashContext.jsx';

export default function FlashMessage() {
  const { flash, clearFlash } = useFlash();

  return (
    <div className="flash-region" role="status" aria-live="polite">
      {flash && (
        <div key={flash.id} className={`flash flash--${flash.type}`}>
          <span>{flash.message}</span>
          <button
            type="button"
            className="flash__close"
            onClick={clearFlash}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
