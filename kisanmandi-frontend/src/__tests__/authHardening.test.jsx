import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';
import VerifyEmail from '../pages/public/VerifyEmail';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import ChangePasswordCard from '../components/ChangePasswordCard';
import * as authService from '../services/authService';
import { AuthContext } from '../context/AuthContext';
import '../i18n';

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

describe('Auth Hardening Frontend Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ForgotPassword Component', () => {
    it('submits email and displays confirmation without leaking account presence', async () => {
      vi.spyOn(authService, 'forgotPassword').mockResolvedValueOnce({
        message: 'If the email exists, a password reset link has been sent.',
      });

      render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitBtn = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@kisanmandi.com' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith('test@kisanmandi.com');
        expect(screen.getByText(/check your inbox/i)).toBeTruthy();
      });
    });
  });

  describe('ResetPassword Component', () => {
    it('shows error state when no reset token is present in URL', () => {
      render(
        <MemoryRouter initialEntries={['/reset-password']}>
          <Routes>
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/invalid or expired link/i)).toBeTruthy();
    });

    it('submits new password when token is present and valid', async () => {
      vi.spyOn(authService, 'resetPassword').mockResolvedValueOnce({
        message: 'Password reset successfully.',
      });

      render(
        <MemoryRouter initialEntries={['/reset-password?token=valid-secret-token']}>
          <Routes>
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/set new password/i)).toBeTruthy();

      const newPasswordInput = screen.getByLabelText(/^new password/i, { selector: 'input' });
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i, { selector: 'input' });
      const submitBtn = screen.getByRole('button', { name: /update password/i });

      fireEvent.change(newPasswordInput, { target: { value: 'NewSecurePassword@123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewSecurePassword@123' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(authService.resetPassword).toHaveBeenCalledWith('valid-secret-token', 'NewSecurePassword@123');
        expect(screen.getByText(/password updated!/i)).toBeTruthy();
      });
    });
  });

  describe('VerifyEmail Component', () => {
    it('automatically verifies email on mount when token is present', async () => {
      vi.spyOn(authService, 'verifyEmail').mockResolvedValueOnce({
        message: 'Email verified successfully.',
      });

      const mockUpdateUser = vi.fn();
      const mockAuthValue = {
        user: { id: 1, email: 'test@example.com', emailVerified: false },
        isAuthenticated: true,
        updateUser: mockUpdateUser,
      };

      render(
        <AuthContext.Provider value={mockAuthValue}>
          <MemoryRouter initialEntries={['/verify-email?token=email-verify-token']}>
            <Routes>
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(authService.verifyEmail).toHaveBeenCalledWith('email-verify-token');
        expect(mockUpdateUser).toHaveBeenCalledWith({ emailVerified: true });
        expect(screen.getByText(/email verified!/i)).toBeTruthy();
      });
    });
  });

  describe('EmailVerificationBanner Component', () => {
    it('renders banner when user is authenticated but email is unverified', () => {
      const mockAuthValue = {
        user: { id: 1, emailVerified: false },
        isAuthenticated: true,
      };

      render(
        <AuthContext.Provider value={mockAuthValue}>
          <EmailVerificationBanner />
        </AuthContext.Provider>
      );

      expect(screen.getByText(/email unverified/i)).toBeTruthy();
    });

    it('does not render when user is verified', () => {
      const mockAuthValue = {
        user: { id: 1, emailVerified: true },
        isAuthenticated: true,
      };

      const { container } = render(
        <AuthContext.Provider value={mockAuthValue}>
          <EmailVerificationBanner />
        </AuthContext.Provider>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('ChangePasswordCard Component', () => {
    it('validates fields and calls changePassword service', async () => {
      vi.spyOn(authService, 'changePassword').mockResolvedValueOnce({
        message: 'Password changed successfully.',
      });

      render(<ChangePasswordCard />);

      const currentInput = screen.getByLabelText(/current password/i, { selector: 'input' });
      const newInput = screen.getByLabelText(/^new password/i, { selector: 'input' });
      const confirmInput = screen.getByLabelText(/confirm new password/i, { selector: 'input' });
      const submitBtn = screen.getByRole('button', { name: /change password/i });

      fireEvent.change(currentInput, { target: { value: 'OldPass@123' } });
      fireEvent.change(newInput, { target: { value: 'NewPass@456' } });
      fireEvent.change(confirmInput, { target: { value: 'NewPass@456' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(authService.changePassword).toHaveBeenCalledWith('OldPass@123', 'NewPass@456');
      });
    });
  });
});
