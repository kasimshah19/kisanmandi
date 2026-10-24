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

import About from '../pages/public/About';
import Help from '../pages/public/Help';
import Footer from '../components/Footer';

describe('About & Help Pages (Recruiter & Farmer-First Hub)', () => {
  it('renders About page with Kasim Shah attribution, architecture overview, and demo accounts', () => {
    renderWithProviders(<About />, { route: '/about' });
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('About KisanMandi');
    expect(screen.getByText(/Kasim Shah/i)).toBeTruthy();
    expect(screen.getByText(/Full-Stack Software Engineer/i)).toBeTruthy();
    expect(screen.getByText(/Spring Boot 3/i)).toBeTruthy();
    expect(screen.getByText(/Tailwind CSS v4/i)).toBeTruthy();
    expect(screen.getAllByText(/amit@test.com/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ramesh@test.com/i).length).toBeGreaterThan(0);
  });

  it('renders Help page with step-by-step customer & farmer guides and interactive FAQ', () => {
    renderWithProviders(<Help />, { route: '/help' });
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Help & How-To Guides');
    expect(screen.getByText(/1\. Choose Fresh Harvest/i)).toBeTruthy();
    
    // Switch to farmer tab
    const farmerTab = screen.getByRole('tab', { name: /How to Sell/i });
    fireEvent.click(farmerTab);
    expect(screen.getByText(/1\. Register in 1 Minute/i)).toBeTruthy();

    expect(screen.getByText(/How do payments work\? Do I need online banking\?/i)).toBeTruthy();
  });

  it('renders Footer with prominent Kasim Shah creator attribution badge', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText(/Kasim Shah/i)).toBeTruthy();
    expect(screen.getByText(/Designed & Built by/i)).toBeTruthy();
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

  it('prefills credentials when clicking recruiter quick test demo buttons', () => {
    renderWithProviders(<Login />, { route: '/login' });
    const farmerBtn = screen.getByText('ramesh@test.com').closest('button');
    fireEvent.click(farmerBtn);
    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput.value).toBe('ramesh@test.com');

    const customerBtn = screen.getByText('amit@test.com').closest('button');
    fireEvent.click(customerBtn);
    expect(emailInput.value).toBe('amit@test.com');
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

