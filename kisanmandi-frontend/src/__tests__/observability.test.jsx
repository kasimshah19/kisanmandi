import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  isExpectedError,
  scrubUrl,
  scrubHeaders,
  sentryBeforeSend,
} from '../utils/sentry';
import ReferenceToast from '../components/ui/ReferenceToast';
import ErrorBoundary from '../components/ErrorBoundary';

describe('Frontend Observability: Sentry Scrubber & Expected Errors', () => {
  it('correctly identifies expected errors to ignore', () => {
    // 401, 403, 404, 409, 422
    expect(isExpectedError({ response: { status: 401 } })).toBe(true);
    expect(isExpectedError({ response: { status: 403 } })).toBe(true);
    expect(isExpectedError({ response: { status: 404 } })).toBe(true);
    expect(isExpectedError({ response: { status: 409 } })).toBe(true);
    expect(isExpectedError({ response: { status: 422 } })).toBe(true);

    // 500 is NOT expected
    expect(isExpectedError({ response: { status: 500 } })).toBe(false);
    expect(isExpectedError(new Error('Null pointer exception'))).toBe(false);

    // ResizeObserver noise
    expect(isExpectedError(new Error('ResizeObserver loop limit exceeded'))).toBe(true);
  });

  it('scrubs query strings and hash fragments from URLs', () => {
    const raw = 'https://kisanmandi.com/api/products?token=secret123&phone=9876543210#section';
    const clean = scrubUrl(raw);
    expect(clean).toBe('https://kisanmandi.com/api/products');
    expect(clean).not.toContain('secret123');
    expect(clean).not.toContain('9876543210');
  });

  it('scrubs Authorization and Cookie headers from objects', () => {
    const headers = {
      'Accept': 'application/json',
      'Authorization': 'Bearer eyJhbGciOi...',
      'Cookie': 'sessionId=abc123xyz',
      'Set-Cookie': 'refresh=456',
      'X-Request-Id': 'req-12345',
    };
    const scrubbed = scrubHeaders(headers);
    expect(scrubbed.Accept).toBe('application/json');
    expect(scrubbed['X-Request-Id']).toBe('req-12345');
    expect(scrubbed.Authorization).toBeUndefined();
    expect(scrubbed.Cookie).toBeUndefined();
    expect(scrubbed['Set-Cookie']).toBeUndefined();
  });

  it('sentryBeforeSend drops expected errors and attaches requestId tag', () => {
    // 1. Expected 404 is dropped
    const event404 = { message: 'Not found' };
    const hint404 = { originalException: { response: { status: 404 } } };
    expect(sentryBeforeSend(event404, hint404)).toBeNull();

    // 2. 500 server error is retained, URL/headers scrubbed, and requestId tagged
    const event500 = {
      message: 'Internal server error',
      request: {
        url: 'https://kisanmandi.com/api/orders?secret=123',
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
        },
        data: { sensitive: 'password' },
      },
    };
    const hint500 = {
      originalException: {
        status: 500,
        requestId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      },
    };

    const processed = sentryBeforeSend(event500, hint500);
    expect(processed).not.toBeNull();
    expect(processed.request.url).toBe('https://kisanmandi.com/api/orders');
    expect(processed.request.headers.Authorization).toBeUndefined();
    expect(processed.request.data).toBe('[Filtered]');
    expect(processed.tags.requestId).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
  });
});

describe('Frontend Support Reference UI', () => {
  it('ReferenceToast renders short reference code and copy button', () => {
    const dummyToast = { id: 'test-1', visible: true };
    render(
      <ReferenceToast
        t={dummyToast}
        requestId="ab12cd34ef567890"
        customMessage="Something went wrong"
      />
    );

    // Reference code first 8 characters
    expect(screen.getByText('ab12cd34')).toBeDefined();
    expect(screen.getByRole('button', { name: /copy/i })).toBeDefined();
  });

  it('ErrorBoundary renders reference code when caught error has requestId', () => {
    const ErrorThrower = () => {
      const err = new Error('Test crash');
      err.requestId = 'deadbeef12345678';
      throw err;
    };

    // Suppress console.error during expected boundary test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorThrower />
      </ErrorBoundary>
    );

    expect(screen.getByText('deadbeef')).toBeDefined();
    spy.mockRestore();
  });
});
