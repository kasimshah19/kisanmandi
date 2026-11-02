// Multi-tab auth synchronization via BroadcastChannel with localStorage fallback
const CHANNEL_NAME = 'kisanmandi_auth';
const STORAGE_KEY = 'kisanmandi_auth_event';

let channel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch {
  // BroadcastChannel unavailable
}

export const broadcastAuthEvent = (type, payload = {}) => {
  const message = { type, payload, timestamp: Date.now() };

  if (channel) {
    try {
      channel.postMessage(message);
    } catch {
      // Ignored
    }
  }

  // Fallback via localStorage event for browsers or environments without BroadcastChannel
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
  } catch {
    // Ignored
  }
};

export const subscribeAuthEvents = (handler) => {
  if (typeof window === 'undefined') return () => {};

  const handleMessage = (event) => {
    if (event?.data) {
      handler(event.data);
    }
  };

  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        handler(data);
      } catch {
        // Ignored
      }
    }
  };

  if (channel) {
    channel.addEventListener('message', handleMessage);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    if (channel) {
      channel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('storage', handleStorage);
  };
};

