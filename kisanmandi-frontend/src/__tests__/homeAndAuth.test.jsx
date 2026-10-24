import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ServerStatusProvider } from '../context/ServerStatusContext';
import '../i18n';

// Class mock for IntersectionObserver
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = MockIntersectionObserver;

function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <ServerStatusProvider>
      <AuthProvider>
        <CartProvider>
          <MemoryRouter initialEntries={[route]}>
            {ui}
          </MemoryRouter>
        </CartProvider>
      </AuthProvider>
    </ServerStatusProvider>
  );
}

describe('Home Page Redesign', () => {
  it('renders Hero headline and direct call-to-actions', () => {
    renderWithProviders(<Home />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Fresh from the farm');
    expect(screen.getAllByText(/Buy Fresh Produce/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Check Mandi Rates/i).length).toBeGreaterThan(0);
  });

  it('renders How It Works tabs and FAQ questions', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/How KisanMandi Works/i)).toBeTruthy();
    expect(screen.getByRole('tab', { name: /For Customers/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /For Farmers/i })).toBeTruthy();
    expect(screen.getByText(/How do I pay for my order\?/i)).toBeTruthy();
  });

  it('does NOT contain old developer System Live Status card or provider names', () => {
    renderWithProviders(<Home />);
    expect(screen.queryByText(/System Live Status/i)).toBeNull();
    expect(screen.queryByText(/Online \(Render\)/i)).toBeNull();
    expect(screen.queryByText(/Connected \(MySQL\)/i)).toBeNull();
  });
});

describe('Login & Register Redesign', () => {
  it('renders Login form with segmented LanguageSwitcher and email/password fields', () => {
    renderWithProviders(<Login />, { route: '/login' });
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Login');
    expect(screen.getByLabelText(/Email Address/i)).toBeTruthy();
    expect(screen.getByLabelText(/Password/i)).toBeTruthy();
  });

  it('preselects FARMER role in Register when ?role=FARMER query param is passed', () => {
    renderWithProviders(<Register />, { route: '/register?role=FARMER' });
    const farmerRadio = screen.getByRole('radio', { name: /Farmer \/ Producer/i });
    expect(farmerRadio.getAttribute('aria-checked')).toBe('true');
  });

  it('shows password strength indicator when typing password in Register', () => {
    renderWithProviders(<Register />, { route: '/register' });
    const pwdInput = screen.getByLabelText(/^Password \*/i);
    fireEvent.change(pwdInput, { target: { value: 'Secret123!' } });
    expect(screen.getByText(/Strong/i)).toBeTruthy();
  });
});
