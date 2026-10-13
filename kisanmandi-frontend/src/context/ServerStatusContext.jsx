import { createContext, useContext, useState, useEffect } from 'react';

const ServerStatusContext = createContext(null);

// Global callbacks for axios interceptors to trigger server waking state
let onServerWakingChange = () => {};

export function triggerServerWaking(isWaking) {
  onServerWakingChange(isWaking);
}

export function ServerStatusProvider({ children }) {
  const [isWaking, setIsWaking] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    onServerWakingChange = (waking) => setIsWaking(waking);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      onServerWakingChange = () => {};
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ServerStatusContext.Provider value={{ isWaking, setIsWaking, isOffline }}>
      {children}
    </ServerStatusContext.Provider>
  );
}

export function useServerStatus() {
  const context = useContext(ServerStatusContext);
  if (!context) {
    throw new Error('useServerStatus must be used within a ServerStatusProvider');
  }
  return context;
}
