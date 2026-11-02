import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { setToken, getToken, clearToken, isTokenExpiringSoon } from '../utils/tokenStore';
import { broadcastAuthEvent, subscribeAuthEvents } from '../utils/authBroadcast';
import PasswordPolicyChecklist, { checkPasswordRules } from '../components/PasswordPolicyChecklist';
import { executeTokenRefresh } from '../services/axiosInstance';
import { AuthProvider } from '../context/AuthContext';

describe('Auth Core - Task 3 Frontend Tests', () => {

  beforeEach(() => {
    clearToken();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearToken();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. TokenStore (in-memory access token)', () => {
    it('stores and retrieves access token without persisting to localStorage', () => {
      expect(getToken()).toBeNull();
      expect(localStorage.getItem('kisanmandi_token')).toBeNull();

      setToken('mock-access-token-xyz', 900);
      expect(getToken()).toBe('mock-access-token-xyz');
      expect(localStorage.getItem('kisanmandi_token')).toBeNull();

      clearToken();
      expect(getToken()).toBeNull();
    });

    it('correctly calculates isTokenExpiringSoon based on lead time', () => {
      // 10 seconds left
      setToken('mock-token', 10);
      expect(isTokenExpiringSoon(60)).toBe(true);
      expect(isTokenExpiringSoon(5)).toBe(false);

      // 120 seconds left
      setToken('mock-token', 120);
      expect(isTokenExpiringSoon(60)).toBe(false);
    });
  });

  describe('2. PasswordPolicyChecklist & Rule Evaluation', () => {
    it('validates minimum length (8 chars), letters, and digits', () => {
      const short = checkPasswordRules('ab1', '');
      expect(short.minLength).toBe(false);
      expect(short.allPassed).toBe(false);

      const noDigit = checkPasswordRules('PasswordLong', '');
      expect(noDigit.hasDigit).toBe(false);
      expect(noDigit.allPassed).toBe(false);

      const noLetter = checkPasswordRules('12345678', '');
      expect(noLetter.hasLetter).toBe(false);
      expect(noLetter.allPassed).toBe(false);
    });

    it('detects common passwords from blocklist', () => {
      const common = checkPasswordRules('password123', '');
      expect(common.notCommon).toBe(false);
      expect(common.allPassed).toBe(false);
    });

    it('detects password containing email local part', () => {
      const containsEmail = checkPasswordRules('RameshPass123', 'ramesh.kumar@gmail.com');
      expect(containsEmail.notContainsEmail).toBe(false);
      expect(containsEmail.allPassed).toBe(false);
    });

    it('passes completely for strong compliant passwords', () => {
      const strong = checkPasswordRules('KrishiVikas99#', 'user@example.com');
      expect(strong.allPassed).toBe(true);
      expect(strong.passedCount).toBe(5);
    });

    it('renders checklist items in the DOM with pass/fail counts', () => {
      render(<PasswordPolicyChecklist password="abc" email="" />);
      expect(screen.getByText(/password requirements/i)).toBeTruthy();
      expect(screen.getByText(/3 \/ 5/i)).toBeTruthy();
    });
  });

  describe('3. Multi-Tab Auth Broadcast & Legacy Token Cleanup', () => {
    it('dispatches and subscribes to auth events across tabs', () => {
      const mockHandler = vi.fn();
      const unsubscribe = subscribeAuthEvents(mockHandler);

      broadcastAuthEvent('logout', { reason: 'session_expired' });
      const stored = localStorage.getItem('kisanmandi_auth_event');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored).type).toBe('logout');

      unsubscribe();
    });

    it('purges legacy localStorage "kisanmandi_token" on app start', async () => {
      vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { token: 'new-token', expiresIn: 900 },
      });

      localStorage.setItem('kisanmandi_token', 'legacy-unsecure-token');
      expect(localStorage.getItem('kisanmandi_token')).toBe('legacy-unsecure-token');

      render(
        <AuthProvider>
          <div>Child App</div>
        </AuthProvider>
      );

      expect(localStorage.getItem('kisanmandi_token')).toBeNull();
    });
  });

  describe('4. Single-Flight Token Refresh', () => {
    it('deduplicates concurrent refresh calls so only ONE network request is made', async () => {
      const postSpy = vi.spyOn(axios, 'post').mockImplementation((url) => {
        if (url.includes('/auth/refresh')) {
          return new Promise((resolve) =>
            setTimeout(() => {
              resolve({
                data: {
                  token: 'new-rotated-token-123',
                  expiresIn: 900,
                  name: 'Ramesh',
                },
              });
            }, 50)
          );
        }
        return Promise.resolve({ data: {} });
      });

      // Launch 3 simultaneous refresh calls
      const [p1, p2, p3] = await Promise.all([
        executeTokenRefresh(),
        executeTokenRefresh(),
        executeTokenRefresh(),
      ]);

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(p1.token).toBe('new-rotated-token-123');
      expect(p2.token).toBe('new-rotated-token-123');
      expect(p3.token).toBe('new-rotated-token-123');
      expect(getToken()).toBe('new-rotated-token-123');
    });

    it('clears session and broadcasts logout on failed refresh', async () => {
      setToken('expiring-token', 10);
      localStorage.setItem('kisanmandi_user', JSON.stringify({ name: 'Ramesh' }));

      vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Invalid refresh token'));

      await expect(executeTokenRefresh()).rejects.toThrow();

      expect(getToken()).toBeNull();
      expect(localStorage.getItem('kisanmandi_user')).toBeNull();
      expect(localStorage.getItem('kisanmandi_auth_event')).toContain('logout');
    });
  });
});
