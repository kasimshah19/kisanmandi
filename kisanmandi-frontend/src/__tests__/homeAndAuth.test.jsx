import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import About from '../pages/public/About';
import Help from '../pages/public/Help';
import Footer from '../components/Footer';
import CategoryTilesSection from '../components/home/CategoryTilesSection';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ServerStatusProvider } from '../context/ServerStatusContext';
import * as siteConfig from '../config/site';
import { categoryService } from '../services/categoryService';
import i18n from '../i18n';

// Mock IntersectionObserver
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

describe('Part 2: Footer & Creator Attribution', () => {
  it('renders centered "Designed & Built by Kasim Shah" in en, hi, and mr', async () => {
    // English
    await i18n.changeLanguage('en');
    const { unmount } = renderWithProviders(<Footer />);
    expect(screen.getByText(/Designed & Built by/i)).toBeTruthy();
    expect(screen.getByText(/Kasim Shah/i)).toBeTruthy();
    unmount();

    // Hindi (Name credit remains in exact English wording as specified)
    await i18n.changeLanguage('hi');
    const { unmount: unmountHi } = renderWithProviders(<Footer />);
    expect(screen.getByText(/Designed & Built by/i)).toBeTruthy();
    expect(screen.getByText(/Kasim Shah/i)).toBeTruthy();
    unmountHi();

    // Marathi (Name credit remains in exact English wording as specified)
    await i18n.changeLanguage('mr');
    const { unmount: unmountMr } = renderWithProviders(<Footer />);
    expect(screen.getByText(/Designed & Built by/i)).toBeTruthy();
    expect(screen.getByText(/Kasim Shah/i)).toBeTruthy();
    unmountMr();

    // Reset back to English
    await i18n.changeLanguage('en');
  });

  it('renders creator name as link only when configured, plain text when not set', () => {
    renderWithProviders(<Footer />);
    const creatorElement = screen.getByText('Kasim Shah');
    // In default siteConfig, LINKEDIN_URL and GITHUB_URL are empty strings
    if (siteConfig.LINKEDIN_URL || siteConfig.GITHUB_URL) {
      expect(creatorElement.tagName.toLowerCase()).toBe('a');
    } else {
      expect(creatorElement.tagName.toLowerCase()).toBe('strong');
    }
  });

  it('does NOT contain hosting or database provider names', () => {
    renderWithProviders(<Footer />);
    expect(screen.queryByText(/Render/i)).toBeNull();
    expect(screen.queryByText(/Vercel/i)).toBeNull();
    expect(screen.queryByText(/PlanetScale/i)).toBeNull();
    expect(screen.queryByText(/Neon/i)).toBeNull();
  });
});

describe('Part 2: Home Page & Sections', () => {
  it('renders Hero headline and two big role buttons', () => {
    renderWithProviders(<Home />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Fresh from the farm');

    // Role buttons (present in Hero and Final CTA)
    expect(screen.getAllByText(/I want to BUY fresh produce/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/I want to SELL my crops/i).length).toBeGreaterThanOrEqual(1);
  });

  it('CategoryTilesSection fetches from categoryService and links with categoryId', async () => {
    vi.spyOn(categoryService, 'getCategories').mockResolvedValueOnce({
      status: 200,
      data: [
        { id: 101, name: 'Fresh Vegetables' },
        { id: 102, name: 'Organic Fruits' },
      ],
    });

    renderWithProviders(<CategoryTilesSection />);

    await waitFor(() => {
      expect(screen.getByText('Fresh Vegetables')).toBeTruthy();
      expect(screen.getByText('Organic Fruits')).toBeTruthy();
    });

    const link = screen.getByText('Fresh Vegetables').closest('a');
    expect(link.getAttribute('href')).toBe('/products?categoryId=101');
  });

  it('CategoryTilesSection gracefully hides if API call fails', async () => {
    vi.spyOn(categoryService, 'getCategories').mockRejectedValueOnce(new Error('Network failure'));

    const { container } = renderWithProviders(<CategoryTilesSection />);

    await waitFor(() => {
      expect(container.querySelector('section')).toBeNull();
    });
  });

  it('does NOT contain old System Live Status card', () => {
    renderWithProviders(<Home />);
    expect(screen.queryByText(/System Live Status/i)).toBeNull();
    expect(screen.queryByText(/Online \(Render\)/i)).toBeNull();
  });
});

describe('Part 2: Help Page', () => {
  it('renders PageHeader and switches between buyer and seller tabs', () => {
    renderWithProviders(<Help />, { route: '/help' });
    expect(screen.getByRole('heading', { level: 1, name: /How to use KisanMandi/i })).toBeTruthy();

    // Default tab: I want to buy
    expect(screen.getByText(/1\. Choose Fresh Harvest/i)).toBeTruthy();

    // Switch to seller tab
    const sellerTab = screen.getByRole('tab', { name: /I want to sell/i });
    fireEvent.click(sellerTab);

    expect(screen.getByText(/1\. Register in 1 Minute/i)).toBeTruthy();
  });

  it('renders email support button only when CONTACT_EMAIL is configured', () => {
    renderWithProviders(<Help />, { route: '/help' });
    const supportLink = screen.queryByRole('link', { name: /Email Support/i });
    if (siteConfig.CONTACT_EMAIL) {
      expect(supportLink).toBeTruthy();
    } else {
      expect(supportLink).toBeNull();
    }
  });
});

describe('Part 2: About Page', () => {
  it('renders About page with mission, Kasim Shah attribution, and verified tech stack', () => {
    renderWithProviders(<About />, { route: '/about' });
    expect(screen.getByRole('heading', { level: 1, name: /About KisanMandi/i })).toBeTruthy();
    expect(screen.getByText(/Kasim Shah/i)).toBeTruthy();
    expect(screen.getAllByText(/Spring Boot 3/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Tailwind CSS v4/i)).toBeTruthy();
    expect(screen.getAllByText(/MySQL 8/i).length).toBeGreaterThanOrEqual(1);

    // Features grouped by Customer, Farmer, Admin
    expect(screen.getByText('Customer')).toBeTruthy();
    expect(screen.getByText('Farmer')).toBeTruthy();
    expect(screen.getByText('Admin')).toBeTruthy();

    // Architecture diagram inline SVG exists
    expect(screen.getByLabelText(/KisanMandi Architecture Diagram/i)).toBeTruthy();
  });

  it('does NOT expose admin passwords or demo credentials on About page', () => {
    renderWithProviders(<About />, { route: '/about' });
    expect(screen.queryByText(/Admin@123/i)).toBeNull();
    expect(screen.queryByText(/password123/i)).toBeNull();
  });
});

describe('Part 2: Login & Register', () => {
  it('renders Login form with 56px inputs and word+icon password toggle', () => {
    renderWithProviders(<Login />, { route: '/login' });
    expect(screen.getByRole('heading', { level: 1, name: /Login|Welcome back/i })).toBeTruthy();

    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput.className).toContain('min-h-[56px]');

    const toggleBtn = screen.getByRole('button', { name: /Show password/i });
    expect(toggleBtn.textContent).toContain('Show');
    fireEvent.click(toggleBtn);
    expect(toggleBtn.textContent).toContain('Hide');
  });

  it('renders demo buttons only when env vars exist, never for admin', () => {
    renderWithProviders(<Login />, { route: '/login' });
    // In testing without VITE_DEMO_* env vars, no demo buttons should be rendered
    expect(screen.queryByText(/Try as admin/i)).toBeNull();
    expect(screen.queryByText(/admin@kisanmandi/i)).toBeNull();
  });

  it('preselects FARMER role in Register when ?role=FARMER query param is passed', () => {
    renderWithProviders(<Register />, { route: '/register?role=FARMER' });
    const farmerChoice = screen.getByRole('radio', { name: /I want to SELL/i });
    expect(farmerChoice.getAttribute('aria-checked')).toBe('true');
  });

  it('shows password strength indicator when typing in Register', () => {
    renderWithProviders(<Register />, { route: '/register' });
    const pwdInput = screen.getByLabelText(/^Password \*/i);
    fireEvent.change(pwdInput, { target: { value: 'Secret123!' } });
    expect(screen.getByText(/Strong/i)).toBeTruthy();
  });
});
