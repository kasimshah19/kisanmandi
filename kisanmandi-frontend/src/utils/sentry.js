/**
 * Sentry lazy initializer and PII scrubber for KisanMandi frontend.
 * Only initializes when VITE_SENTRY_DSN is configured.
 */

export function isExpectedError(error, event) {
  // 1. Axios expected HTTP status codes (401, 403, 404, 409, 422)
  const status = error?.response?.status || error?.status;
  if (status && [401, 403, 404, 409, 422].includes(status)) {
    return true;
  }

  // 2. Offline / Network connectivity errors
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }
  const msg = error?.message || event?.message || '';
  if (msg.includes('Network Error') || msg.includes('Failed to fetch') || msg.includes('Load failed')) {
    return true;
  }

  // 3. ResizeObserver noise
  if (msg.includes('ResizeObserver loop limit exceeded') || msg.includes('ResizeObserver loop completed')) {
    return true;
  }

  return false;
}

export function scrubUrl(url) {
  if (!url || typeof url !== 'string') return url;
  try {
    const parsed = new URL(url, 'http://localhost');
    return `${parsed.protocol === 'http:' && !url.startsWith('http') ? '' : parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split('?')[0].split('#')[0];
  }
}

export function scrubHeaders(headers) {
  if (!headers || typeof headers !== 'object') return headers;
  const scrubbed = { ...headers };
  const sensitive = ['authorization', 'cookie', 'set-cookie', 'x-auth-token', 'proxy-authorization'];
  for (const key of Object.keys(scrubbed)) {
    if (sensitive.includes(key.toLowerCase())) {
      delete scrubbed[key];
    }
  }
  return scrubbed;
}

export function sentryBeforeSend(event, hint) {
  const error = hint?.originalException;

  if (isExpectedError(error, event)) {
    return null; // drop expected errors
  }

  // Scrub URL query strings & hash
  if (event.request) {
    if (event.request.url) {
      event.request.url = scrubUrl(event.request.url);
    }
    if (event.request.headers) {
      event.request.headers = scrubHeaders(event.request.headers);
    }
    if (event.request.data) {
      event.request.data = '[Filtered]';
    }
  }

  // Scrub breadcrumb URLs and headers
  if (Array.isArray(event.breadcrumbs)) {
    event.breadcrumbs = event.breadcrumbs.map((b) => {
      const copy = { ...b };
      if (copy.data?.url) {
        copy.data = { ...copy.data, url: scrubUrl(copy.data.url) };
      }
      if (copy.data?.headers) {
        copy.data = { ...copy.data, headers: scrubHeaders(copy.data.headers) };
      }
      return copy;
    });
  }

  // Attach requestId tag if available on error
  const reqId = error?.requestId || hint?.data?.requestId;
  if (reqId) {
    event.tags = { ...(event.tags || {}), requestId: reqId };
  }

  return event;
}

/**
 * Lazy loads and initializes Sentry if VITE_SENTRY_DSN is provided.
 */
export async function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || typeof dsn !== 'string' || !dsn.trim()) {
    return null;
  }

  try {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn: dsn.trim(),
      environment: import.meta.env.MODE || 'production',
      tracesSampleRate: 0,
      sendDefaultPii: false,
      beforeSend: sentryBeforeSend,
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications.',
        'Network Error',
      ],
    });

    window.__sentry = Sentry;
    return Sentry;
  } catch (err) {
    console.warn('Failed to lazy load Sentry:', err);
    return null;
  }
}

/**
 * Safely captures an unhandled exception into Sentry if active.
 */
export function captureException(error, context) {
  if (typeof window !== 'undefined' && window.__sentry) {
    if (error?.requestId) {
      window.__sentry.setTag('requestId', error.requestId);
    }
    window.__sentry.captureException(error, context);
  }
}
