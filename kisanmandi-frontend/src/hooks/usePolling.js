import { useEffect, useRef, useCallback } from 'react';

/**
 * Adaptive polling hook with tab visibility awareness and exponential backoff.
 * 
 * @param {Function} callback - Async or sync function to execute periodically.
 * @param {Object} options
 * @param {number} [options.intervalMs=30000] - Base polling interval in milliseconds.
 * @param {boolean} [options.whenVisible=true] - Only poll when the browser tab is visible.
 * @param {boolean} [options.backoff=true] - Apply exponential backoff on errors up to maxIntervalMs.
 * @param {number} [options.maxIntervalMs=300000] - Maximum interval on backoff (default 5 minutes).
 * @param {boolean} [options.enabled=true] - Whether polling is active.
 * @param {boolean} [options.immediate=true] - Run callback immediately on mount / enable.
 */
export default function usePolling(callback, options = {}) {
  const {
    intervalMs = 30000,
    whenVisible = true,
    backoff = true,
    maxIntervalMs = 300000,
    enabled = true,
    immediate = true,
  } = options;

  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const inFlightRef = useRef(false);
  const timeoutIdRef = useRef(null);
  const currentIntervalRef = useRef(intervalMs);
  const consecutiveErrorsRef = useRef(0);
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Clear pending timeout
  const clearScheduled = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  // Execute tick and schedule next
  const executeTick = useCallback(async () => {
    if (!enabledRef.current) return;

    // Check visibility if whenVisible is enabled
    if (whenVisible && typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }

    // Prevent overlapping executions
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      if (typeof callbackRef.current === 'function') {
        await callbackRef.current();
      }
      // On success, reset backoff
      consecutiveErrorsRef.current = 0;
      currentIntervalRef.current = intervalMs;
    } catch {
      // Tolerate error and apply backoff if configured
      if (backoff) {
        consecutiveErrorsRef.current += 1;
        const multiplier = Math.min(Math.pow(2, consecutiveErrorsRef.current), 10);
        currentIntervalRef.current = Math.min(intervalMs * multiplier, maxIntervalMs);
      }
    } finally {
      inFlightRef.current = false;
      // Schedule next tick if still enabled
      if (enabledRef.current) {
        clearScheduled();
        timeoutIdRef.current = setTimeout(executeTick, currentIntervalRef.current);
      }
    }
  }, [intervalMs, whenVisible, backoff, maxIntervalMs, clearScheduled]);

  // Main polling lifecycle
  useEffect(() => {
    if (!enabled) {
      clearScheduled();
      return;
    }

    currentIntervalRef.current = intervalMs;
    consecutiveErrorsRef.current = 0;

    if (immediate) {
      executeTick();
    } else {
      timeoutIdRef.current = setTimeout(executeTick, intervalMs);
    }

    return () => clearScheduled();
  }, [enabled, intervalMs, immediate, executeTick, clearScheduled]);

  // Listen to tab visibility & window focus
  useEffect(() => {
    if (!enabled || !whenVisible) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabledRef.current) {
        // Immediate tick when returning to visible tab
        clearScheduled();
        executeTick();
      }
    };

    const handleFocus = () => {
      if (enabledRef.current && (!whenVisible || document.visibilityState === 'visible')) {
        clearScheduled();
        executeTick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, whenVisible, executeTick, clearScheduled]);

  // Force trigger method for manual refreshes
  const trigger = useCallback(() => {
    if (!enabledRef.current) return;
    clearScheduled();
    executeTick();
  }, [clearScheduled, executeTick]);

  return { trigger };
}
