import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// A single app-wide success message that survives page navigation
// (e.g. "Ticket #4 created" shown after redirecting to the new ticket).

const FlashContext = createContext(null);
const DISMISS_AFTER_MS = 4000;

export function FlashProvider({ children }) {
  const [flash, setFlash] = useState(null);

  const showFlash = useCallback((message, type = 'success') => {
    setFlash({ message, type, id: Date.now() });
  }, []);

  const clearFlash = useCallback(() => setFlash(null), []);

  useEffect(() => {
    if (!flash) return undefined;
    const timer = setTimeout(() => setFlash(null), DISMISS_AFTER_MS);
    return () => clearTimeout(timer);
  }, [flash]);

  return (
    <FlashContext.Provider value={{ flash, showFlash, clearFlash }}>
      {children}
    </FlashContext.Provider>
  );
}

export function useFlash() {
  const context = useContext(FlashContext);
  if (!context) throw new Error('useFlash must be used inside <FlashProvider>.');
  return context;
}
